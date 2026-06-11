(function () {
  const refs = {
    form: document.getElementById("billForm"),
    dateInput: document.getElementById("dateInput"),
    typeInput: document.getElementById("typeInput"),
    categoryInput: document.getElementById("categoryInput"),
    noteInput: document.getElementById("noteInput"),
    amountInput: document.getElementById("amountInput"),
    previewText: document.getElementById("previewText"),
    formMessage: document.getElementById("formMessage")
  };

  // 将输入金额格式化为两位小数字符串，空值按 0 处理。
  function formatCurrency(value) {
    return Number(value || 0).toFixed(2);
  }

  // 获取今天日期，格式为 YYYY-MM-DD，用于 date 输入框。
  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  // 初始化或重置日期字段为当天。
  function setDefaultDate() {
    refs.dateInput.value = getToday();
  }

  // 根据账单类型返回预览所需文案、符号和样式类。
  function getTypeMeta(type) {
    if (type === "expense") {
      return { text: "支出", sign: "-", className: "preview__value--expense" };
    }
    return { text: "收入", sign: "+", className: "preview__value--income" };
  }

  // 根据当前类型和金额更新右侧预览文字与颜色。
  function updatePreview() {
    const amount = formatCurrency(refs.amountInput.value);
    const meta = getTypeMeta(refs.typeInput.value);

    refs.previewText.className = "preview__value " + meta.className;
    refs.previewText.textContent = meta.text + " " + meta.sign + amount;
  }

  // 在表单下方显示提示信息，并根据类型切换提示样式。
  function showMessage(text, type) {
    refs.formMessage.hidden = !text;
    refs.formMessage.textContent = text || "";
    refs.formMessage.className = "form-message";

    if (type === "error") {
      refs.formMessage.classList.add("form-message--error");
    }

    if (type === "success") {
      refs.formMessage.classList.add("form-message--success");
    }
  }

  // 校验表单关键字段，返回错误文案；无错误时返回空字符串。
  function validateFormData(data) {
    if (!data.date) return "请选择账单日期";
    if (!data.category) return "请输入账单类别";
    if (!data.amount || Number(data.amount) <= 0) return "请输入大于 0 的金额";
    return "";
  }

  // 从表单控件读取并组装账单数据对象。
  function collectFormData() {
    return {
      id: Date.now().toString(),
      date: refs.dateInput.value,
      type: refs.typeInput.value,
      category: refs.categoryInput.value.trim(),
      note: refs.noteInput.value.trim(),
      amount: Number(refs.amountInput.value)
    };
  }

  // 将新账单写入本地存储，使用数组头插保持最新在前。
  function saveToLocalStorage(data) {
    const key = "notebook-bills";
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(data);
    localStorage.setItem(key, JSON.stringify(list));
  }

  // 处理表单提交：校验、保存、提示并重置界面状态。
  function handleSubmit(event) {
    event.preventDefault();
    // 收集表单数据
    const data = collectFormData();
    // 校验数据合法性
    const error = validateFormData(data);
    // 如果有错误，显示错误信息并停止提交流程
    if (error) {
      showMessage(error, "error");
      return;
    }
    // 数据合法，保存账单并显示成功提示
    console.log("保存账单数据：", data);
    saveToLocalStorage(data);
    // 调用 fetch 将数据发送到服务器
    // 封装一个函数来发送 fetch 请求，简化代码并处理响应。
    async function sendData() {
      // try-catch 用于捕获 fetch 请求中的网络错误或服务器错误
      try {
        // 引入封装的 fetchRequest 函数，发送 POST 请求到 /add 路由，传递账单数据
        const response = await fetchRequest("/add", "POST", "application/json", data);
        console.log("服务器响应：", response);
      } catch (err) {
        console.error("请求失败：", err);
      }
    }
    // 调用 sendData 函数发送数据到服务器
    sendData();
    showMessage("账单已保存（示例保存到浏览器本地存储）", "success");

    refs.form.reset();
    setDefaultDate();
    refs.typeInput.value = "income";
    updatePreview();
  }
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

  // 处理重置后的界面恢复：清空消息、回填默认值并刷新预览。
  function handleReset() {
    showMessage("", "");
    setDefaultDate();
    refs.typeInput.value = "income";
    updatePreview();
  }

  // 处理 reset 事件，等待浏览器完成原生重置后再执行自定义恢复。
  function handleFormResetEvent() {
    setTimeout(handleReset, 0);
  }

  refs.typeInput.addEventListener("change", updatePreview);
  refs.amountInput.addEventListener("input", updatePreview);
  refs.form.addEventListener("submit", handleSubmit);
  refs.form.addEventListener("reset", handleFormResetEvent);

  setDefaultDate();
  updatePreview();
})();
