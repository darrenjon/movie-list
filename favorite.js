const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/' //
const POSTER_URL = BASE_URL + '/posters/' //處理圖片檔案
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

//讓每個函式儘量保持單純執行一件事
//函式 renderMovieList 會接收外面傳進來的陣列，並利用 forEach 將資料一筆筆取出，所以每個 item 都會是一部電影
function renderMovieList(data) {
  let rawHTML = '' // 裝解析data後的HTML
  //傳入的data是陣列，所以使用forEach
  data.forEach((item) => {
    //console.log(item) 查看，需要載入的資料是title, image 來產生 80 部電影的 HTML 結構
    //在電影卡片的 More button 標籤中，新增一個 data-id="${item.id}" 的屬性，在動態組合樣板的時期，不只拿每部電影的 title 和 image 屬性，連 id 屬性也要放進來
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

//宣告一個新的 showMovieModal 函式，並使用 axios 發送 request，然後將結果輸出至 modal
function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  //show API 需要傳入title、description、release_date、image
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

//用傳入的 id 去找到要移除的電影
function removeFromFavorite(id) {
  // 若收藏清單是空的，或傳入的 id 在收藏清單中不存在，就結束這個函式（return)
  if (!movies || !movies.length) return
  // 使用 findIndex 來透過 id 找要刪除電影的 index。如果沒有找到符合的項目，則會回傳 false -1
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  // 得知 index 之後，使用陣列的 splice 方法來移除該項目
  movies.splice(movieIndex, 1)
  // 再次存回 local storage 中 favoriteMovies 的資料，由於localStorage 資料儲存的格式 key 和 value 都只能接受「字串 」 ，所以將 movies 陣列轉換成JSON string，並且儲存在 favoriteMovies 這個 key 裡面
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  // 更新渲染的頁面
  renderMovieList(movies)
}


//動態綁定按鈕的點擊事件 (click events)
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
    //若使用者點擊了收藏按鈕，就會呼叫 addToFavorite() 並傳入電影的 id
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)