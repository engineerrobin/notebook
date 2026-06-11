(function () {
  // 定义一个全局变量来存储账单数据，初始为空数组。
  let bills = [];
  // 封装一个函数来发送 fetch 请求，简化代码并处理响应。
  function fetchRequest(url,method,type,body){
    return fetch(url, {
      method: method,
        headers: {
            'Content-Type': type
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).catch(err => {
        console.error("请求失败：", err);
    });
  }
  async function loadBills() {
    try {
      const data = await fetchRequest("/api/bills", "GET", "application/json");
      bills = data.bills;
        renderSummary();
        renderTable();
    } catch (err) {
      console.error("加载账单数据失败：", err);
    }  
  }
  loadBills();
  // 获取当前用户名并显示在页面上
  function loadUser() {
    const username = localStorage.getItem("notebook-login-user");
    // 获取dom元素
    const userTextNode = document.querySelector(".hero__user-badge span:last-child");
    // 如果元素不存在，直接返回，避免后续操作报错
    if (!userTextNode) return;
    // 如果用户名存在，显示欢迎信息；否则显示默认文本。
    if (username) {
      userTextNode.textContent = `您好 ${username}`;
      return;
    }
    // 没有用户名，显示默认文本
    userTextNode.textContent = "您好";
  }

  loadUser();

  const state = {
    keyword: "",
    type: "all",
    sort: "dateDesc"
  };

  const refs = {
    body: document.getElementById("billTableBody"),
    empty: document.getElementById("emptyState"),
    keywordInput: document.getElementById("keywordInput"),
    typeFilter: document.getElementById("typeFilter"),
    sortFilter: document.getElementById("sortFilter"),
    incomeTotal: document.getElementById("incomeTotal"),
    expenseTotal: document.getElementById("expenseTotal"),
    balanceTotal: document.getElementById("balanceTotal")
  };

  // 将数字金额格式化为保留两位小数的字符串。
  function currency(value) {
    return Number(value).toFixed(2);
  }

  // 按当前排序条件返回新数组，避免直接修改原数组。
  function sortBills(list) {
    const sorted = list.slice();
    sorted.sort((a, b) => {
      if (state.sort === "dateAsc") return a.date.localeCompare(b.date);
      if (state.sort === "dateDesc") return b.date.localeCompare(a.date);
      if (state.sort === "amountAsc") return a.amount - b.amount;
      return b.amount - a.amount;
    });
    return sorted;
  }

  // 根据关键字和类型过滤账单，再应用排序规则。
  function getFilteredBills() {
    const keyword = state.keyword.trim().toLowerCase();
    const filtered = bills.filter((item) => {
      const typeOk = state.type === "all" || item.type === state.type;
      const text = (item.category + " " + item.note).toLowerCase();
      const keywordOk = !keyword || text.includes(keyword);
      return typeOk && keywordOk;
    });

    return sortBills(filtered);
  }

  // 统计收入、支出与结余，并渲染到概览卡片。
  function renderSummary() {
    const income = bills
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = bills
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    refs.incomeTotal.textContent = currency(income);
    refs.expenseTotal.textContent = currency(expense);
    refs.balanceTotal.textContent = currency(income - expense);
  }

  // 根据筛选结果渲染表格行与空状态提示。
  function renderTable() {
    const list = getFilteredBills();

    refs.body.innerHTML = list
      .map((item) => {
        const sign = item.type === "income" ? "+" : "-";
        const typeText = item.type === "income" ? "收入" : "支出";
        const typeClass = item.type === "income" ? "income" : "expense";

        return [
          "<tr>",
          `<td>${item.date}</td>`,
          `<td>${item.category}</td>`,
          `<td>${item.note}</td>`,
          `<td><span class=\"type type--${typeClass}\">${typeText}</span></td>`,
          `<td class=\"align-right amount--${typeClass}\">${sign} ${currency(item.amount)}</td>`,
          `<td class=\"align-right\"><button class=\"action-btn\" data-id=\"${item._id}\">删除</button></td>`,
          "</tr>"
        ].join("");
      })
      .join("");

    refs.empty.hidden = list.length !== 0;
  }

  // 处理表格内删除按钮点击（事件委托），删除后刷新统计和表格。
  function handleDeleteClick(event) {
    const target = event.target;
    console.log("Clicked element:", target);
    if (!(target instanceof HTMLButtonElement)) return;
    // 获取账单 ID
    const id = target.dataset.id;
    console.log("Deleting bill with id:", id);
    const index = bills.findIndex((item) => item.id === id);
    // 发送删除请求到服务器，成功后再更新本地数据和界面
    async function deleteBill() {
        try {
            // 发送 DELETE 请求到服务器删除账单
            await fetchRequest("/api/bills/" + id, "DELETE", "application/json");
            // 从本地数据中删除账单
            // bills.splice(index, 1);
            // 重新渲染统计
            renderSummary();
            // 重新渲染表格
            renderTable();
            // 重新加载账单数据以保持与服务器同步
            loadBills();
        } catch (err) {
            console.error("删除账单失败：", err);
        }
    }
    deleteBill();
    // if (index === -1) return;

    // bills.splice(index, 1);
    // renderSummary();
    // renderTable();
  }

  // 监听关键字输入并实时过滤表格。
  refs.keywordInput.addEventListener("input", function (event) {
    state.keyword = event.target.value;
    renderTable();
  });

  // 监听类型筛选变化并更新表格。
  refs.typeFilter.addEventListener("change", function (event) {
    state.type = event.target.value;
    renderTable();
  });

  // 监听排序条件变化并更新表格。
  refs.sortFilter.addEventListener("change", function (event) {
    state.sort = event.target.value;
    renderTable();
  });

  // 监听表格区域点击，统一处理删除按钮。
  refs.body.addEventListener("click", handleDeleteClick);
  // 监听添加账单按钮点击
    document.getElementsByClassName("hero__action")[0].addEventListener("click", function () {
        // 跳转到添加账单页面
        window.location.href = "/add";
    });
  renderSummary();
  renderTable();
})();