/**
 * ブックマーク表示コンポーネント
 */
Vue.component('bookmark-component', {
  template: '#bookmark-component',
  props: {
    bookmark: Object,
  },
  computed: {
    /**
     * フォルダ名を結合したブックマーク名を返す
     * @return {String}
     */
    fullPath() {
      return `${this.bookmark.folder}${this.bookmark.title || 'no title'}`;
    },
    /**
     * ステータス表示テキストを返す
     * @return {String}
     */
    statusText() {
      return `${this.bookmark.status || '-'}`;
    },
    /**
     * ステータス表示用のスタイルクラス名を返す
     * @return {Object}
     */
    statusClass() {
      return {
        'status-ok': this.bookmark.ok === true,
        'status-ng': this.bookmark.ok === false,
        'status-none': this.bookmark.ok !== true && this.bookmark.ok !== false,
      }
    },
    /**
     * ブックマークのURLを返す
     * @return {String} url
     */
    url() {
      return this.bookmark.url;
    }
  },
})
/**
 * ブックマーク一覧表示コンポーネント
 */
Vue.component('bookmark-app', {
  template: '#bookmark-app',
  data() {
    return {
      bookmarks: [],
    };
  },
  methods: {
    /**
     * ブックマークツリーを取得する
     * @return {Promise}
     */
    fetchBookmarks() {
      return chrome.bookmarks.getTree();
    },
    /**
     * ブックマークツリーを一次元配列にならす
     * @param {Object} bookmark bookmark tree
     * @param {String} folder parent folder name
     * @return {Array} bookmark array
     */
    flatten(bookmark, folder = '') {
      if (bookmark && bookmark.children) {
        return bookmark.children.reduce((arr, b) => {
          return arr.concat(this.flatten(b, `${folder}${bookmark.title}/`));
        }, []);
      }

      // parent folder name
      bookmark.folder = folder;
      // for HTTP status
      bookmark.status = null;
      bookmark.ok = null;

      return [bookmark];
    },
    /**
     * ブックマークツリーを取得して一次元配列にならす
     */
    async reload() {
      this.bookmarks = [];
      const bookmarks = await this.fetchBookmarks();

      const f = this.flatten(bookmarks[0]);

      this.bookmarks = f;
    },
    /**
     * HTTPリクエストを投げてレスポンスを評価する
     */
    check() {
      this.bookmarks.map(async b => {
        b.status = 0;
        b.ok = false;

        let res;
        try {
          res = await fetch(b.url);
        } catch (e) {
          console.warn(e);
        } finally {
          if (res) {
            b.status = res.status || 0;
            b.ok = res.ok || false;
          }
          return b;
        }
      });
    },
    /**
     * 指定インデックスのブックマークを削除する
     * ステータスが初期化されてしまうためツリー再取得は行わない
     * @param {String} index bookmarklist index(NOT bookmark.id)
     */
    async del(index) {
      if (window.confirm('are you sure?')) {
        const bookmark = this.bookmarks[index];
        await chrome.bookmarks.remove(bookmark.id);
        this.bookmarks = this.bookmarks.filter((b, i) => i !== index);
      }
    }
  },
  computed: {
    /**
     * ブックマーク一覧が読み込まれているか（１件以上あるか）
     * @return {Boolean}
     */
    isReady() {
      return this.bookmarks.length > 0;
    },
  },
  created() {
    this.reload();
  }
});

const app = new Vue({
  el: '#app'
})