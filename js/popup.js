Vue.component('bookmark-component', {
  template: '#bookmark-component',
  props: {
    bookmark: Object,
  },
  computed: {
    /**
     * build the bookmark title with parents folder title.
     * @return {String}
     */
    fullPath() {
      return `${this.bookmark.folder}${this.bookmark.title || 'no title'}`;
    },
    statusText() {
      return `${this.bookmark.status || '-'}`;
    },
    statusClass() {
      return {
        'status-ok': this.bookmark.ok === true,
        'status-ng': this.bookmark.ok === false,
        'status-none': this.bookmark.ok !== true && this.bookmark.ok !== false,
      }
    },
  },
})

const app = new Vue({
  el: '#app',
  data: {
    bookmarks: [],
  },
  methods: {
    /**
     * fetch bookmark tree data.
     * @return {Promise}
     */
    fetchBookmarks() {
      return chrome.bookmarks.getTree();
    },
    /**
     * flatten bookmark tree.
     * @param {Object} bookmark bookmark tree
     * @param {String} folder parent folder name
     * @return {Array} bookmarks
     */
    flatten(bookmark, folder = '') {
      if (bookmark && bookmark.children) {
        return bookmark.children.reduce((arr, b) => {
          return arr.concat(this.flatten(b, `${folder}${bookmark.title}/`));
        }, []);
      }

      // parent folder name
      bookmark.folder = folder
      // for HTTP status
      bookmark.status = null;
      bookmark.ok = null;

      return [bookmark];
    },
    async reload() {
      this.bookmarks = [];
      const bookmarks = await this.fetchBookmarks();


      const f = this.flatten(bookmarks[0]);

      console.log(f);

      this.bookmarks = f;
    },
    check() {
      this.bookmarks.map(async b => {
        let res;
        try {
          console.log(b.url);
          res = await fetch(b.url);
        } catch (e) {
          console.warn(e);
        }
        finally {
          if (res) {
            b.status = res.status || 0;
            b.ok = res.ok || false;
          }
          return b;
        }
      });
    },
    /**
     * delete a bookmark
     * @param {String} index bookmarklist id(NOT bookmark.id)
     */
    async del(index) {
      if (window.confirm('are you sure?')) {
        const bookmark = this.bookmarks[index];
        await chrome.bookmarks.remove(bookmark.id);
        this.bookmarks = this.bookmarks.filter((b, i) => i !== index);
      }
    }
  },
  created() {
    this.reload();
  }
})