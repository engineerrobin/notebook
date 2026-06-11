(function () {
  const refs = {
    form: document.getElementById("loginForm"),
    usernameInput: document.getElementById("usernameInput"),
    passwordInput: document.getElementById("passwordInput"),
    rememberInput: document.getElementById("rememberInput"),
    formMessage: document.getElementById("formMessage")
  };

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

  function validate(data) {
    if (!data.username) return "请输入用户名";
    if (data.username.length < 2) return "用户名至少 2 位";
    if (!data.password) return "请输入密码";
    if (data.password.length < 6) return "密码至少 6 位";
    return "";
  }

  function collectData() {
    return {
      username: refs.usernameInput.value.trim(),
      password: refs.passwordInput.value,
      remember: refs.rememberInput.checked
    };
  }
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
  function handleSubmit(event) {
    event.preventDefault();
    const data = collectData();
    const error = validate(data);

    if (error) {
      showMessage(error, "error");
      return;
    }
    fetchRequest('/acount/login', 'POST', 'application/json', {username: data.username, password: data.password}).then(response => {
      if (response.status === 'success') {
        showMessage(response.message, "success");
            // 模拟登录成功后跳转
        setTimeout(function () {
          window.location.href = "/list";
        }, 500);
      } else {
        // 登录失败，显示服务器返回的错误信息
        showMessage(response.message, "error");
      }
    });
    if (data.remember) {
      localStorage.setItem("notebook-login-user", data.username);
    } else {
      localStorage.removeItem("notebook-login-user");
    }
  }

  function initRememberedUser() {
    const savedUser = localStorage.getItem("notebook-login-user");
    if (!savedUser) return;
    refs.usernameInput.value = savedUser;
    refs.rememberInput.checked = true;
  }

  refs.form.addEventListener("submit", handleSubmit);
  initRememberedUser();
})();
