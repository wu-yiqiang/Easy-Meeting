import { d as defineComponent, m as createBlock, w as withCtx, k as ref, r as resolveComponent, o as openBlock, b as createVNode, f as createTextVNode, q as toRaw, v as router } from "./index-CNt34EYJ.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Login",
  setup(__props) {
    const isLogin = ref(true);
    const form = ref({
      email: "wu_yiqiang@outlook.com",
      password: "1234@Abcd",
      wsUrl: "https://192",
      userInfo: { name: "Sutter" },
      verifyCode: ""
    });
    const onRegister = async () => {
      console.log("submit!");
      isLogin.value = false;
      await window.electron.ipcRenderer.invoke("loginOrRegister", isLogin.value);
      console.log("oooo");
    };
    const onLogin = async () => {
      await window.electron.ipcRenderer.invoke("loginSuccess", toRaw(form.value));
      router.push("/home");
    };
    return (_ctx, _cache) => {
      const _component_el_input = resolveComponent("el-input");
      const _component_el_form_item = resolveComponent("el-form-item");
      const _component_el_col = resolveComponent("el-col");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_form = resolveComponent("el-form");
      return openBlock(), createBlock(_component_el_form, {
        model: form.value,
        "label-width": "auto",
        style: { "max-width": "600px" }
      }, {
        default: withCtx(() => [
          createVNode(_component_el_form_item, { label: "邮箱" }, {
            default: withCtx(() => [
              createVNode(_component_el_input, {
                modelValue: form.value.email,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.value.email = $event)
              }, null, 8, ["modelValue"])
            ]),
            _: 1
          }),
          createVNode(_component_el_form_item, { label: "密码" }, {
            default: withCtx(() => [
              createVNode(_component_el_col, null, {
                default: withCtx(() => [
                  createVNode(_component_el_input, {
                    modelValue: form.value.password,
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.value.password = $event)
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          createVNode(_component_el_form_item, null, {
            default: withCtx(() => [
              createVNode(_component_el_button, { onClick: onRegister }, {
                default: withCtx(() => [..._cache[2] || (_cache[2] = [
                  createTextVNode("注册", -1)
                ])]),
                _: 1
              }),
              createVNode(_component_el_button, {
                type: "primary",
                onClick: onLogin
              }, {
                default: withCtx(() => [..._cache[3] || (_cache[3] = [
                  createTextVNode("登录", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["model"]);
    };
  }
});
export {
  _sfc_main as default
};
