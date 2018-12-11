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

      return [bookmark];
    },
    /**
     * build the bookmark title with parents folder title.
     * @param {Object} b bookmark object
     * @return {String}
     */
    fullPath(b) {
      return `${b.folder}${ b.title || 'no title' }`;
    },

    async reload() {
      this.bookmarks = [];
      const bookmarks = await this.fetchBookmarks();


      const f = this.flatten(bookmarks[0]);


      this.bookmarks = f;
    },
    check() {
      this.bookmarks.map(async b => {
        const res = await fetch(b.url);

        b.status = res.ok;

        return b;
      });
    },
  },
  created() {
    this.reload();
  }
})