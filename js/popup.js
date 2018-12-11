// console.log('popup!');

// const app = {
//   $app: null,
//   init() {
//     this.$app = $('#app');
//   },
//   fetchBookmarks() {
//     return chrome.bookmarks.getTree();
//   },
//   render(bookmarks) {
//     this.$app.html(
//       bookmarks.reduce((html, b) => {
//         return `${ html }
//         <tr>
//           <td>
//           </td>
//           <td>
//             <div>${ b.folder }${ b.title || 'no title' }</div>
//             <div><a href="${ b.url }">${ b.url }</a></div>
//           </td>
//         </tr>`;
//       }, ''))
//   },
//   flatten(bookmark, folder = '') {
//     if (bookmark && bookmark.children) {
//       return bookmark.children.reduce((arr, b) => {
//         return arr.concat(app.flatten(b, `${folder}${bookmark.title}/`));
//       }, []);
//     }
//     bookmark.folder = folder
//     return [bookmark];
//   }

// };


// (async function () {
//   app.init();

//   const bookmarks = await app.fetchBookmarks();

//   console.log(bookmarks[0]);

//   const f = app.flatten(bookmarks[0]);

//   console.log(f);

//   app.render(f)

// })();


var app = new Vue({
  el: '#app',
  data: {
    bookmarks: [],
  },
  methods: {
    fetchBookmarks() {
      return chrome.bookmarks.getTree();
    },
    flatten(bookmark, folder = '') {
      if (bookmark && bookmark.children) {
        return bookmark.children.reduce((arr, b) => {
          return arr.concat(this.flatten(b, `${folder}${bookmark.title}/`));
        }, []);
      }
      bookmark.folder = folder
      return [bookmark];
    },
    fullPath(b) {
      return `${b.folder}${ b.title || 'no title' }`;
    }
  },
  async created() {
    const bookmarks = await this.fetchBookmarks();

    console.log(bookmarks);

    const f = this.flatten(bookmarks[0]);

    console.log(f);

    this.bookmarks = f;
  }
})