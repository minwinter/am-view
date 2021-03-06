import Vue from 'vue';

const Indicator = Vue.extend(require('../components/Indicator'));
let instance;
let timer;

export default {
  open(options = {}) {
    if (!instance) {
      instance = new Indicator({
        el: document.createElement('div')
      });
    }
    if (instance.visible) return;
    instance.text = typeof options === 'string' ? options : options.text || '';

    document.body.appendChild(instance.$el);
    if (timer) {
      clearTimeout(timer);
    }

    Vue.nextTick(() => {
      instance.visible = true;
    });
  },

  close() {
    if (instance) {
      instance.visible = false;
      timer = setTimeout(() => {
        if (instance.$el) {
          instance.$el.style.display = 'none';
        }
      }, 400);
    }
  }
};
