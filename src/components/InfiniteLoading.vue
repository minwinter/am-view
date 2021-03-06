<template>
  <div class="infinite-loading-container">
    <div v-show="isLoading">
      <slot name="spinner">
        <div class="infinite-loading">
          <spinner :type="spinner"></spinner>
        </div>
      </slot>
    </div>
    <div class="infinite-status-prompt" v-show="!isLoading && isComplete && isFirstLoad">
      <slot name="no-results">No results :(</slot>
    </div>
    <div class="infinite-status-prompt" v-show="!isLoading && isComplete && !isFirstLoad">
      <slot name="no-more">No more data :)</slot>
    </div>
  </div>
</template>
<script>
  // fork from https://github.com/PeachScript/vue-infinite-loading
  import Spinner from './Spinner';
  /**
   * get the first scroll parent of an element
   * @param  {DOM} elm    the element which find scorll parent
   * @return {DOM}        the first scroll parent
   */
  function getScrollParent(elm) {
    if (elm.tagName === 'BODY') {
      return window;
    } else if (['scroll', 'auto'].indexOf(getComputedStyle(elm).overflowY) > -1) {
      return elm;
    }
    return getScrollParent(elm.parentNode);
  }
  /**
   * get current distance from footer
   * @param  {DOM} elm    scroll element
   * @return {Number}     distance
   */
  function getCurrentDistance(elm) {
    const styles = getComputedStyle(elm === window ? document.body : elm);
    const innerHeight = elm === window
                      ? window.innerHeight
                      : parseInt(styles.height, 10);
    const scrollHeight = elm === window
                       ? document.body.scrollHeight
                       : elm.scrollHeight;
    const scrollTop = isNaN(elm.scrollTop) ? elm.pageYOffset : elm.scrollTop;
    const paddingTop = parseInt(styles.paddingTop, 10);
    const paddingBottom = parseInt(styles.paddingBottom, 10);
    return scrollHeight - innerHeight - scrollTop - paddingTop - paddingBottom;
  }
  export default {
    data() {
      return {
        scrollParent: null,
        scrollHandler: null,
        isLoading: false,
        isComplete: false,
        isFirstLoad: true, // save the current loading whether it is the first loading
      };
    },
    components: {
      Spinner
    },
    props: {
      distance: {
        type: Number,
        default: 100,
      },
      onInfinite: Function,
      spinner: {
        type: String,
        default: 'shape'
      }
    },
    mounted() {
      this.scrollParent = getScrollParent(this.$el);
      this.scrollHandler = function scrollHandlerOriginal() {
        const currentDistance = getCurrentDistance(this.scrollParent);
        if (!this.isLoading && currentDistance <= this.distance) {
          this.isLoading = true;
          if (this.onInfinite) {
            this.onInfinite.call();
          }
        }
      }.bind(this);
      setTimeout(this.scrollHandler, 1);
      this.scrollParent.addEventListener('scroll', this.scrollHandler);
      this.$on('$InfiniteLoading:loaded', () => {
        this.isLoading = false;
        this.isFirstLoad = false;
      });
      this.$on('$InfiniteLoading:complete', () => {
        this.isLoading = false;
        this.isComplete = true;
        this.scrollParent.removeEventListener('scroll', this.scrollHandler);
      });
      this.$on('$InfiniteLoading:reset', () => {
        this.isLoading = false;
        this.isComplete = false;
        this.isFirstLoad = true;
        this.scrollParent.addEventListener('scroll', this.scrollHandler);
        setTimeout(this.scrollHandler, 1);
      });
    },
    destroyed() {
      if (!this.isComplete) {
        this.scrollParent.removeEventListener('scroll', this.scrollHandler);
      }
    },
  };
</script>
