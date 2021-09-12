## 事故描述:

对于一个attribute设置了autocomplete='off'的input密码框, chrome依然会提示保存的密码.

![image-20210719100639524](C:\Users\yangyang08\AppData\Roaming\Typora\typora-user-images\image-20210719100639524.png)

## 事故原因:

This is because with HTML, this attribute (like any other), is a suggestion to the browser.

To make things a little more complicated, browsers may also autofill form fields based on the field’s `name` or `id` attributes.

This is how browsers did it before the `autocomplete` attribute came along.

So for maximum support use both the `name` and `autocomplete` attributes.

But if you want Chrome (and other browsers) to stop autofilling fields then you need to use a `name`, `id` and `autocomplete` value that the browser doesn’t recognise.



## 密码回显组件要点:

> 更新内容: 对biz-skylar-validate-input组件进行修改,在不影响原有使用的基础上;
>
> 解决问题: 密码不应回显; 父组件通过biz-skylar-data-schema传入验证规则时, 组件的 ref 需要和校验的字段一一致, 所以不方便封装原组件, 选择进入原组件进行修改;
>
> \1. index实现组件显示内容的切换--父组件传参(type="password", saftyPasswordMode="true")决定子组件展现形式, 不传默认为保持原有样式;
>
> \2. 更新了子组件safty-password, 为基于原验证表单处理了密码回显
>
> \3. 更新了子组件common-input, 为biz-skylar-validate-input的原有功能
>
> \4. 暴露出autocomplete方法



## 碰到的问题:

1. 要求只是不能真实密码回显,那么如何实现比较好? 我原来的想法是,两个input,一个显示虚假密码***,一个为输入框,当进入输入状态,虚假密码不可见,显示输入框; 但是发现验证规则卸载mixins里,调用$ref.validateinput.f00()进行的验证, 即validate-input必须只有一个,而且切换框需要autofocus,也没暴露出来; 所以最终方案是: 在validate-input组件上进行修改, 添加一个model, 进入此model即为保密密码模式;
2. autocomplete传进来无效; 原因是因为q-input(el-input)子组件的问题, 该组件因为vue属性名用-连接的问题,暴露出的为auto-complete, 但是原生input标签只接受autocomplete, 所以即使我传进来一个autocomplete, q-input的组件还是默认值;
3. 显示的密码和真实密码要分开,如果用户不做更改,直接点击保存,此时保存的为未显示的真是密码;
4. 最后,validate-input没有小眼睛,需要暴露出来

最终代码:

```vue
<template>
  <div class="validate-input">
    <q-input
      :value="showValue"
      :disabled="disabled"
      :placeholder="pwdPlaceholder"
      :class="`q-validate-input ${isError? 'is-error' : ''} ${isPlaceholderColor?'isPlaceholderColor':''}`"
      :type="type"
      :maxlength="maxlength"
      :minlength="minlength"
      :autocomplete="autocompleteValue"
      :show-password="isshowPassword"
      @input="onInput"
    />
    <q-tooltip
      v-if="isError"
      class="item text-error"
      effect="dark"
      :content="validateMessage"
      placement="top"
    >
      <i class="q-input__icon q-icon-error" @click="reset" />
    </q-tooltip>
  </div>
</template>

<script>
import Schema from 'async-validator';
import { isString, isUndefined } from 'lodash';

const DEFAULT_PASSWORD = '********';

export default {
  name: 'BizSkylarValidateInput',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    rules: {
      type: Array,
      default: () => []
    },
    value: {
      type: [String, Number],
      default: ''
    },
    disabled: {
      type: Boolean,
      defalue: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    saveOrigin: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: undefined
    },
    minlength: {
      type: Number,
      default: undefined
    },
    //切换非明文密码形式
    isSafetyPasswordModel: {
      type: Boolean,
      default: false
    },
    //暴露出原生的autocomplete属性
    autocomplete: {
      type: String,
      default: ''
    },
    //暴露出q-input框的小眼睛明文密码属性
    showPassword: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentValue: this.value,
      validateMessage: '',
      originValue: this.value,
      validateStatus: 'success',
      isSafetyPassword: this.value ? (this.type === 'password' && this.isSafetyPasswordModel) : false, //默认空密码为未设置密码,不需要加密
      isDirty: false, //编辑状态
      // defaultPwd: DEFAULT_PASSWORD,
      defaultPwd: '',
    };
  },
  computed: {
    showValue: {
      get () {
        if (this.isSafetyPassword && this.isDirty === false) {
          return this.defaultPwd;
        } else {
          if (this.disabled && this.saveOrigin) {
            return this.originValue;
          } else {
            return this.currentValue;
          }
        }
      }
    },
    isError() {
      return this.validateStatus === 'error';
    },
    isPlaceholderColor() {
      //当用户设置isSPM时, 判断初始value是否为空, 为空则ph="请输入..."默认浅色; 不为空则设置ph="***"深色
      return this.isSafetyPassword && !this.isDirty || false;
    },
    autocompleteValue() {
      //1.用户设置了autocomplete => 优先用用户设置的值
      //2.用户只设置isSPM,没设置autocomplete => 默认auto=new-password
      //3.用户没设置isSPM,没设置autocomplete => 默认auto=off
      return this.autocomplete && (this.isSafetyPasswordModel ? 'new-password' : 'off');
    },
    isshowPassword() {
      return this.isDirty;
    },
    pwdPlaceholder() {
      //DEFAULT_PASSWORD只用于初次回显时显示,进入编辑状态即显示原默认提示信息
      return this.isSafetyPassword ? (this.isDirty ? this.placeholder : DEFAULT_PASSWORD) : this.placeholder;
    }
  },
  watch: {
    async value(val) {
      if (this.currentValue !== val) {
        this.currentValue = val;
        if ((isString(val) && val === '') || isUndefined(val)) {
          this.setValidateOptions('success', '');
        } else {
          this.validate();
        }
      }
    },
    disabled(val) {
      if (val) {
        if (this.saveOrigin) {
          this.$emit('change', this.originValue);
        }
        this.setValidateOptions('success', '');
      }
    }
  },
  methods: {
    onInput(val) {
      this.currentValue = val;
      this.isDirty = this.isDirty || true;
      this.validate();
      this.$emit('change', val);
    },
    validate(cb) {
      return new Promise(resolve => {
        if (this.disabled) {
          return resolve(true);
        }
        if (this.rules.length === 0) {
          return resolve(true);
        }
        var validator = new Schema({ value: this.rules });
        validator.validate(
          { value: this.currentValue || '' },
          (errors, fields) => {
            if (errors && Array.isArray(errors)) {
              const { message } = errors[0];
              this.setValidateOptions('error', message);
              resolve(false);
              if (cb) {
                cb(false, errors, fields);
              }
            } else {
              this.setValidateOptions('success', '');
              resolve(true);
              if (cb) {
                cb(true, errors, fields);
              }
            }
          }
        );
      });
    },
    reset() {
      this.$emit('change', '');
      this.setValidateOptions('success', '');
    },
    clear() {
      this.setValidateOptions('success', '');
    },
    setValidateOptions(validateStatus = 'success', validateMessage = '') {
      this.validateStatus = validateStatus;
      this.validateMessage = validateMessage;
    },
    // handleFocus() {
    // },
    // handleBlur() {
    // }
  }
};
</script>
```

使用方式:

```
<template>
 <div>
  <biz-skylar-validate-input
    ref="input"
    type="password"
    is-safety-password-model
    v-model="input"
    placeholder="请输入1-8位数字密码"
  />
 <span>
    保存时获取的密码为: {{input}}
  </span>
 </div>

</template>
```

