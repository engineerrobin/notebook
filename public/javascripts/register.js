(function () {
  const refs = {
    form: document.getElementById("registerForm"),
    usernameInput: document.getElementById("usernameInput"),
    phoneInput: document.getElementById("phoneInput"),
    emailInput: document.getElementById("emailInput"),
    passwordInput: document.getElementById("passwordInput"),
    confirmInput: document.getElementById("confirmInput"),
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

  function isValidPhone(phone) {
    return /^1\d{10}$/.test(phone);
  }

  function validate(data) {
    if (!data.username) return "请输入用户名";
    if (data.username.length < 4) return "用户名至少 4 位";
    if (!isValidPhone(data.phone)) return "请输入正确的手机号";
    if (!data.email) return "请输入邮箱";
    if (!data.password || data.password.length < 6) return "密码至少 6 位";
    if (data.password !== data.confirmPassword) return "两次密码输入不一致";
    return "";
  }

  function collectData() {
    return {
      username: refs.usernameInput.value.trim(),
      phone: refs.phoneInput.value.trim(),
      email: refs.emailInput.value.trim(),
      password: refs.passwordInput.value,
      confirmPassword: refs.confirmInput.value
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
    console.log("Collected data:", data);
    fetchRequest('/acount/register', 'POST', 'application/json', data).then(response => {
      if (response.status === 'success') {
        showMessage("注册成功", "success");
        refs.form.reset();
      } else {
        showMessage("注册失败", "error");
      }
    });
    const error = validate(data);

    if (error) {
      showMessage(error, "error");
      return;
    }

    showMessage("注册信息已通过校验，可接后端接口", "success");
    refs.form.reset();
  }

  function handleReset() {
    showMessage("", "");
  }

  refs.form.addEventListener("submit", handleSubmit);
  refs.form.addEventListener("reset", function () {
    setTimeout(handleReset, 0);
  });
})();
