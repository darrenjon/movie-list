const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/' 
const POSTER_URL = BASE_URL + '/posters/' //處理圖片檔案
const MOVIES_PER_PAGE = 12

const movies = [] //存放有 80 個項目的movie陣列
let filteredMovies = [] //儲存符合篩選條件的項目

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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

// 從總清單裡切割資料，然後回傳切割好的新陣列
function getMoviesByPage(page) {
  //計算總頁數
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

//建立 addToFavorite 函式
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // 請 find 去電影總表中查看，找出 id 相同的電影物件回傳，暫存在 movie
  const movie = movies.find((movie) => movie.id === id)
  // 避免重複加入，檢查陣列中是否已經存在收藏的電影id，有就回報true
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  // 把 movie 推進收藏清單
  list.push(movie)
  // 接著呼叫 localStorage.setItem，把更新後的收藏清單同步到 local stroage
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//建立一個變數 searchForm 來存放搜尋表單這個 DOM 元件，然後為它做一個事件監聽器 (event listener)，監聽搜尋表單的提交 (submit) 事件。 我們將這個事件要觸發的函式 (event handler)
searchForm.addEventListener('click', function onSearchFormSubmitted(event) {
  //console.log('click!') for test
  //希望當使用者按下 Search 提交搜尋表單時，頁面不會刷新 (重新導向目前頁面)
  event.preventDefault() //請瀏覽器終止元件的預設行為
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //錯誤處理：輸入無效字串
  //if (!keyword.length) {
  //  return alert('請輸入有效字串！')
  //}
  //條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //重製分頁器
  renderPaginator(filteredMovies.length)
  //重新輸出至畫面
  renderMovieList(getMoviesByPage(1))
})


//動態綁定按鈕的點擊事件 (click events)
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
    //若使用者點擊了收藏按鈕，就會呼叫 addToFavorite() 並傳入電影的 id
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))