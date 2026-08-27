import { d as defineComponent, r as resolveComponent, o as openBlock, c as createElementBlock, a as createBaseVNode, b as createVNode, w as withCtx, u as unref, e as edit_default, s as search_default, f as createTextVNode, g as share_default, h as upload_default, i as onMounted, F as Fragment, j as renderList, k as ref, l as computed, n as normalizeClass, t as toDisplayString, m as createBlock, p as createCommentVNode } from "./index-CNt34EYJ.js";
const _hoisted_1$6 = { class: "Metting" };
const _hoisted_2$4 = { class: "mettingBox" };
const _hoisted_3$3 = { class: "addmetting" };
const _hoisted_4$2 = { class: "addmetting" };
const _hoisted_5 = { class: "addmetting" };
const _hoisted_6 = { class: "addmetting" };
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "Metting",
  setup(__props) {
    return (_ctx, _cache) => {
      const _component_el_icon = resolveComponent("el-icon");
      return openBlock(), createElementBlock("section", _hoisted_1$6, [
        createBaseVNode("div", _hoisted_2$4, [
          createBaseVNode("div", _hoisted_3$3, [
            createVNode(_component_el_icon, { size: 30 }, {
              default: withCtx(() => [
                createVNode(unref(edit_default))
              ]),
              _: 1
            }),
            _cache[0] || (_cache[0] = createBaseVNode("span", null, " 加入会议 ", -1))
          ]),
          createBaseVNode("div", _hoisted_4$2, [
            createVNode(_component_el_icon, { size: 30 }, {
              default: withCtx(() => [
                createVNode(unref(search_default))
              ]),
              _: 1
            }),
            _cache[1] || (_cache[1] = createTextVNode("快速会议 ", -1))
          ]),
          createBaseVNode("div", _hoisted_5, [
            createVNode(_component_el_icon, { size: 30 }, {
              default: withCtx(() => [
                createVNode(unref(share_default))
              ]),
              _: 1
            }),
            _cache[2] || (_cache[2] = createTextVNode("预定会议 ", -1))
          ]),
          createBaseVNode("div", _hoisted_6, [
            createVNode(_component_el_icon, { size: 30 }, {
              default: withCtx(() => [
                createVNode(unref(upload_default))
              ]),
              _: 1
            }),
            _cache[3] || (_cache[3] = createTextVNode("共享屏幕 ", -1))
          ])
        ])
      ]);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const Metting = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-75703423"]]);
const _hoisted_1$5 = { class: "Cover" };
const _hoisted_2$3 = ["src"];
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "Cover",
  props: {
    url: {
      type: String,
      required: true,
      default: () => ""
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$5, [
        createBaseVNode("img", {
          src: __props.url,
          alt: ""
        }, null, 8, _hoisted_2$3)
      ]);
    };
  }
});
const Cover = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-b32f43b2"]]);
const _hoisted_1$4 = { class: "ScreenCap" };
const _hoisted_2$2 = { class: "CapBox" };
const _hoisted_3$2 = ["onClick"];
const _hoisted_4$1 = { class: "screenName" };
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ScreenCap",
  props: {
    value: {
      type: String,
      required: false,
      default: () => null
    }
  },
  emits: ["update:value"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const screenSources = ref([]);
    const props = __props;
    const screenDisplayId = computed({
      get: () => props.value,
      set: (val) => emit("update:value", val)
    });
    const selectSource = (source) => {
      screenDisplayId.value = source.displayId;
    };
    const getScreen = async () => {
      screenSources.value = await window.electron.ipcRenderer.invoke("getScreenSource", {
        types: ["screen"],
        thumbnailSize: {
          width: 600,
          height: 300
        }
      });
      if (!screenSources.value?.length) return;
      screenDisplayId.value = screenSources.value[0].displayId;
    };
    onMounted(() => {
      getScreen();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$4, [
        _cache[0] || (_cache[0] = createBaseVNode("div", { class: "Captitle" }, "选择录制屏幕", -1)),
        createBaseVNode("div", _hoisted_2$2, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(screenSources.value, (screenSource, index2) => {
            return openBlock(), createElementBlock("div", {
              key: index2,
              class: normalizeClass(["Cap", screenDisplayId.value === screenSource.displayId ? "selectedCap" : null]),
              onClick: ($event) => selectSource(screenSource)
            }, [
              createVNode(Cover, {
                url: screenSource?.thumbnail
              }, null, 8, ["url"]),
              createBaseVNode("div", _hoisted_4$1, toDisplayString(screenSource?.name), 1)
            ], 10, _hoisted_3$2);
          }), 128))
        ])
      ]);
    };
  }
});
const ScreenCap = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-d543f440"]]);
const _hoisted_1$3 = { class: "Record" };
const _hoisted_2$1 = { class: "left-pannel" };
const _hoisted_3$1 = { class: "start-record" };
const _hoisted_4 = { class: "right-pannel" };
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const currentScreenDisplayId = ref(null);
    const recordStatus = ref(0);
    const startRecord = async () => {
      recordStatus.value = 1;
      await window.electron.ipcRenderer.invoke("startRecording", {
        displayId: currentScreenDisplayId.value,
        mic: ""
      });
    };
    return (_ctx, _cache) => {
      const _component_el_button = resolveComponent("el-button");
      const _component_el_divider = resolveComponent("el-divider");
      return openBlock(), createElementBlock("section", _hoisted_1$3, [
        createBaseVNode("div", _hoisted_2$1, [
          _cache[2] || (_cache[2] = createBaseVNode("div", { class: "recorder-setting" }, [
            createBaseVNode("div", { class: "title" }, "录制设置")
          ], -1)),
          createBaseVNode("div", _hoisted_3$1, [
            createVNode(_component_el_button, {
              type: "primary",
              disabled: !currentScreenDisplayId.value,
              onClick: startRecord
            }, {
              default: withCtx(() => [..._cache[1] || (_cache[1] = [
                createTextVNode("开始录制", -1)
              ])]),
              _: 1
            }, 8, ["disabled"])
          ])
        ]),
        createVNode(_component_el_divider, { direction: "vertical" }),
        createBaseVNode("div", _hoisted_4, [
          createVNode(ScreenCap, {
            value: currentScreenDisplayId.value,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => currentScreenDisplayId.value = $event)
          }, null, 8, ["value"])
        ])
      ]);
    };
  }
});
const Record = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-cfceb35f"]]);
const _hoisted_1$2 = { class: "Contact" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "Contact",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$2, " Contact ");
    };
  }
});
const Contact = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-0e41a8d3"]]);
const _hoisted_1$1 = { class: "Settings" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$1, " shezhi1 ");
    };
  }
});
const Settings = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-b55f04ae"]]);
const _hoisted_1 = { class: "Layout" };
const _hoisted_2 = { class: "tabs" };
const _hoisted_3 = { class: "contents" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  setup(__props) {
    const tabPosition = ref("metting");
    return (_ctx, _cache) => {
      const _component_el_radio_button = resolveComponent("el-radio-button");
      const _component_el_radio_group = resolveComponent("el-radio-group");
      return openBlock(), createElementBlock("section", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(_component_el_radio_group, {
            modelValue: tabPosition.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => tabPosition.value = $event)
          }, {
            default: withCtx(() => [
              createVNode(_component_el_radio_button, { value: "metting" }, {
                default: withCtx(() => [..._cache[1] || (_cache[1] = [
                  createTextVNode("会议", -1)
                ])]),
                _: 1
              }),
              createVNode(_component_el_radio_button, { value: "contact" }, {
                default: withCtx(() => [..._cache[2] || (_cache[2] = [
                  createTextVNode("通讯录", -1)
                ])]),
                _: 1
              }),
              createVNode(_component_el_radio_button, { value: "record" }, {
                default: withCtx(() => [..._cache[3] || (_cache[3] = [
                  createTextVNode("录制", -1)
                ])]),
                _: 1
              }),
              createVNode(_component_el_radio_button, { value: "settings" }, {
                default: withCtx(() => [..._cache[4] || (_cache[4] = [
                  createTextVNode("设置", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["modelValue"])
        ]),
        createBaseVNode("div", _hoisted_3, [
          tabPosition.value == "metting" ? (openBlock(), createBlock(Metting, { key: 0 })) : createCommentVNode("", true),
          tabPosition.value == "record" ? (openBlock(), createBlock(Record, { key: 1 })) : createCommentVNode("", true),
          tabPosition.value == "contact" ? (openBlock(), createBlock(Contact, { key: 2 })) : createCommentVNode("", true),
          tabPosition.value == "settings" ? (openBlock(), createBlock(Settings, { key: 3 })) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b90fa73c"]]);
export {
  index as default
};
