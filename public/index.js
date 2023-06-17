//load localStorage contents with key 'books' into bookArray variable
//if items exist, parse JSON and store in array, otherwise store empty array
let bookArray = localStorage.getItem('books') ? 
JSON.parse(localStorage.getItem('books')) : [];

//execute startFunction when browser window is loaded
window.onload = startFunction();

//when page is loaded, display existing bookArray elements and book count 
function startFunction() {
    if(bookArray != '') {
        let count = 0;
        //iterate through all array elements and get values to add book entries
        for(let i = 0; i < bookArray.length; i++) {
            let imageSrc = bookArray[i].imageSrc;
            let title = bookArray[i].title;
            let author = bookArray[i].author;
            let genre = bookArray[i].genre;
            let status = bookArray[i].status;
            let comments = bookArray[i].comments;
            addBookEntry(imageSrc, title, author, genre, status, comments);
            //increase count by one for each entry
            count++;
        }
        document.getElementsByClassName('book-count')[0].innerHTML = count;
    }
}

/* 'Add book' button */
let addBookBtn = document.getElementById('add-book-btn');
//add event listener to the button to execute addBookClicked function
addBookBtn.addEventListener('click', addBookClicked);

/* 'Search cover image' button */
let searchBtn = document.getElementById('search-btn');
//add event listener to the button to execute getCover function
searchBtn.addEventListener('click', getCover);

//execute when 'Search cover image' is clicked
async function getCover(event) {
    let button = event.target;
    //get main book container of the button
    let bookContainer = button.parentElement.parentElement;
    //change button text while API call is made
    button.textContent = 'Searching...';

    let ISBN = bookContainer.getElementsByClassName('book-ID')[0].value;
    try{
        //insert ISBN value in search URL  
        let url = 'https://covers.openlibrary.org/b/isbn/' + ISBN + '.json';
        const response = await fetch(url);
        //get data in JSON format
        const resData = await response.json();
        console.log(resData);

        //if no cover was found, send alert to user
        if(resData.source_url == ""){
            alert('No cover was found for this ISBN. Please try another value.');
            button.textContent = 'Search cover image';
        }
        else { //execute if cover was found
            let coverImage = bookContainer.getElementsByClassName('cover-image')[0];
            //update cover image source for book container with retrieved value
            coverImage.setAttribute('src', resData.source_url);

            let bookEntries = document.getElementsByClassName('book-entries')[0];
            let bookRows = bookEntries.getElementsByClassName('book-row');
            //iterate through all book entries to match corresponding bookArray element
            for(let i = 0; i < bookRows.length; i++) {
                if(bookRows[i] === bookContainer) {
                    //update cover image source with retrieved value for book element in localStorage 
                    bookArray[i].imageSrc = resData.source_url;
                    button.textContent = 'Search cover image';
                    return;
                }
            }
            //change to default button text
            button.textContent = 'Search cover image';
        }
    }
    catch(error){ 
        alert('No cover was found for this ISBN. Please try another value.');
        button.textContent = 'Search cover image';
        console.log(error);
    }
}

//execute when 'Add book' is clicked
function addBookClicked(event) {
    /*
    * Every time the Add book button is clicked, the function retrieves
    * the relevant values of the book from respective elements and calls
    * the storeObject and addBookEntry functions
    */
    //get button object
    let button = event.target;
    //get main book container i.e. top parent element of button
    let bookContainer = button.parentElement.parentElement;
    //assign individual book details to corresponding variables
    let imageSrc = bookContainer.getElementsByClassName('cover-image')[0].src;
    let bookDetails = bookContainer.getElementsByClassName('detail-input');
    let title = bookDetails[0].value;
    let author = bookDetails[1].value;
    let genre = bookDetails[2].value;
    let status = bookContainer.getElementsByClassName('status')[0].value; //gets drop-down menu selection
    let comments = document.getElementById('comments').value;

    //alert user if title field is empty
    if(title == ''){
        alert('Please enter a title.');
        return;
    }
    
    /* Check for duplicate entries */
    //get all current entries in the list
    let bookEntries = document.getElementsByClassName('book-entries')[0];
    //get title and author values
    let bookEntryTitles = bookEntries.getElementsByClassName('book-entry-title');
    let bookEntryAuthors = bookEntries.getElementsByClassName('book-entry-author');
    //iterate through all entries
    for (let i = 0; i < bookEntryTitles.length; i++) {
        //compare existing titles to new entry added
        if (bookEntryTitles[i].innerHTML == title ) {
            //if title is same, check for author
            if((bookEntryAuthors[i].innerHTML == author) || author == '') {
                //if author also matches or is empty, alert user and exit function
                alert('This book is already added to the list.');
                return;
            } 
        }
    }

    //save book to localStorage
    storeObject(imageSrc, title, author, genre, status, comments);

    //pass retrieved values as arguments to function for adding the book container
    addBookEntry(imageSrc, title, author, genre, status, comments);

    //update book count
    let count = document.getElementsByClassName('book-count')[0].innerHTML;
    count++;
    document.getElementsByClassName('book-count')[0].innerHTML = count;    
    
    //change input areas to default values
    bookContainer.getElementsByClassName('cover-image')[0].setAttribute('src', './images/blank_image.jpg'); 
    bookContainer.getElementsByClassName('book-ID')[0].value = ''; //clear ISBN input
    bookContainer.getElementsByClassName('detail-input')[0].value = ''; //clear title input
    bookContainer.getElementsByClassName('detail-input')[1].value = ''; //clear author input
    bookContainer.getElementsByClassName('detail-input')[2].value = ''; //clear genre input
    document.getElementsByClassName('status')[0].value = 'Reading'; //set status to default selection
    document.getElementById('comments').value = ''; //clear comments input

    console.log('Add button successful');
}

function addBookEntry(imageSrc, title, author, genre, status, comments) {
    //create a new div element for the new book entry with class name 'book-row'
    let bookEntry = document.createElement('div');
    bookEntry.classList.add('book-row');

    let bookEntries = document.getElementsByClassName('book-entries')[0];
    /* New div element layout with disabled textareas, using backtick (``) for variable insertion */
    let bookEntryContents = `
        <div class="area1">
            <!--book cover image from API--> 
            <img src="${imageSrc}" alt="cover-image" class="cover-image">
        </div>
        <div class="area2"> 
            <div class="detail-container">
                <label for="title">Title: </label>
                <textarea name="title" id="title" class="book-entry-title" cols="25" rows="2" 
                style="resize: none;" disabled>${title}</textarea>
            </div>
            <div class="detail-container">
                <label for="author">Author(s): </label>
                <textarea name="author" id="author" class="book-entry-author" cols="25" rows="2" 
                style="resize: none;" disabled>${author}</textarea>
            </div>
            <div class="detail-container">
                <label for="genre">Genre(s): </label>
                <textarea name="genre" id="genre" class="book-entry-genre" cols="25" rows="2" 
                style="resize: none;" disabled>${genre}</textarea>
            </div>
            <div class="detail-container">
                <label for="Status">Status: </label>
                <textarea name="status" id="status" class="book-entry-status" cols="25" rows="2" 
                style="resize: none;" disabled>${status}</textarea>
            </div>
        </div>
        <div class="area3">
            <div class="comment-area">
                <textarea name="comments" id="" class="book-entry-comments" cols="25" rows="11" 
                style="resize: none;" placeholder="Jot down your thoughts here!" disabled>${comments}</textarea>
            </div> 
            <div class="btn-container">
                <!--button with 'edit entry' functionality-->
                <button type="button" class="btn edit-book-btn">Edit details</button>
                <!--button with 'remove entry' functionality-->
                <button type="button" class="btn remove-book-btn">Remove book</button>
            </div>
        </div>`;
    //set styling to book row div
    bookEntry.innerHTML = bookEntryContents;
    //append the new div to the 'book-entries' class
    bookEntries.append(bookEntry);

    //add event listeners to the edit and remove button
    bookEntry.getElementsByClassName('edit-book-btn')[0].addEventListener('click', editBookEntry);
    bookEntry.getElementsByClassName('remove-book-btn')[0].addEventListener('click', removeBookEntry);
}

//execute when 'Remove book' is clicked
function removeBookEntry(event) {
    let button = event.target;
    let mainContainer = button.parentElement.parentElement.parentElement;
    //call removeObject function to remove book object from localStorage
    removeObject(mainContainer);
    //remove book row div from webpage
    mainContainer.remove();
    //update book count
    let count = document.getElementsByClassName('book-count')[0].innerHTML;
    count--;
    document.getElementsByClassName('book-count')[0].innerHTML = count;   
    console.log('Remove button successful');
}

//execute when 'Edit details' is clicked
function editBookEntry(event) {
    let button = event.target;
    let bookEntry = button.parentElement.parentElement.parentElement;

    //enable div textareas
    let imageSrc = bookEntry.getElementsByClassName('cover-image')[0].src;
    let imageArea = bookEntry.getElementsByClassName('area1')[0];
    imageArea.innerHTML = `
    <!--book cover image from API--> 
    <img src="${imageSrc}" alt="cover-image" class="cover-image" width="150">
    <textarea name="ISBN" id="ISBN" class="book-ID" cols="20" rows="1" 
    style="resize: none;" placeholder="Enter book ISBN"></textarea>
    <button class="btn search-btn">Search cover image</button>`;
    let title = bookEntry.getElementsByClassName('book-entry-title')[0];
    title.disabled = false;
    let author = bookEntry.getElementsByClassName('book-entry-author')[0];
    author.disabled = false;
    let genre = bookEntry.getElementsByClassName('book-entry-genre')[0];
    genre.disabled = false;
    let comments = bookEntry.getElementsByClassName('book-entry-comments')[0];
    comments.disabled = false;
    let status = bookEntry.getElementsByClassName('detail-container')[3];
    //set status selection back to drop-down menu
    status.innerHTML = `
        <label for="status">Reading Status: </label>
        <!-- drop-down menu for selecting reading status -->
        <div class="status-selection">
            <select id="status" class="status" name="status"><!--drop-down menu-->
                <option value="Reading">Reading</option><!--default selection-->
                <option value="Completed">Completed</option>
                <option value="To Be Read">To Be Read</option>
                <option value="Did Not Finish">Did Not Finish</option>
                <option value="Wishlisted">Wishlisted</option>
            </select>
        </div>`;
    //create new button container with update button
    bookEntry.getElementsByClassName('btn-container')[0].remove();
    let newBtnContents = `
        <!--button with 'update entry' functionality-->
        <button type="button" class="btn update-book-btn">Update details</button>
        <!--button with 'remove entry' functionality-->
        <button type="button" class="btn remove-book-btn">Remove book</button>`;
    let newBtnContainer = document.createElement('div');
    newBtnContainer.classList.add('btn-container');
    newBtnContainer.innerHTML = newBtnContents;
    let area3 = bookEntry.getElementsByClassName('area3')[0];
    area3.append(newBtnContainer);

    //add event listeners to buttons
    bookEntry.getElementsByClassName('update-book-btn')[0].addEventListener('click', updateBookEntry);
    bookEntry.getElementsByClassName('remove-book-btn')[0].addEventListener('click', removeBookEntry);
    bookEntry.getElementsByClassName('search-btn')[0].addEventListener('click', getCover);

    console.log('Edit button successful');
}

//execute when 'Update details' is clicked
function updateBookEntry(event) {
    let button = event.target;
    let bookEntry = button.parentElement.parentElement.parentElement;
    
    let title = bookEntry.getElementsByClassName('book-entry-title')[0];
    //alert user if title field is empty
    if(title.value == ''){
        alert('Please enter a title.');
        return;
    }

    //disable textareas and elements to return to display view with updated values
    title.disabled = true;
    let imageSearch = bookEntry.getElementsByClassName('book-ID')[0];
    imageSearch.setAttribute('hidden', 'true');
    let searchBtn = bookEntry.getElementsByClassName('search-btn')[0];
    searchBtn.setAttribute('hidden', 'true');
    let author = bookEntry.getElementsByClassName('book-entry-author')[0];
    author.disabled = true;
    let genre = bookEntry.getElementsByClassName('book-entry-genre')[0];
    genre.disabled = true;
    let statusValue = bookEntry.getElementsByClassName('status')[0].value;
    let status = bookEntry.getElementsByClassName('detail-container')[3];
    status.innerHTML = `
        <label for="Status">Status: </label>
        <textarea name="status" id="status" class="book-entry-status" cols="25" rows="2" 
        style="resize: none;" disabled>${statusValue}</textarea>`;
    let comments = bookEntry.getElementsByClassName('book-entry-comments')[0];
    comments.disabled = true;
    //change to original button container with edit button
    bookEntry.getElementsByClassName('btn-container')[0].remove();
    let newBtnContents = `
        <!--button with 'edit entry' functionality-->
        <button type="button" class="btn edit-book-btn">Edit details</button>
        <!--button with 'remove entry' functionality-->
        <button type="button" class="btn remove-book-btn">Remove book</button>`;
    let newBtnContainer = document.createElement('div');
    newBtnContainer.classList.add('btn-container');
    newBtnContainer.innerHTML = newBtnContents;
    let area3 = bookEntry.getElementsByClassName('area3')[0];
    area3.append(newBtnContainer);

    //add event listeners to buttons
    bookEntry.getElementsByClassName('edit-book-btn')[0].addEventListener('click', editBookEntry);
    bookEntry.getElementsByClassName('remove-book-btn')[0].addEventListener('click', removeBookEntry);

    let bookEntries = document.getElementsByClassName('book-entries')[0];
    let bookRows = bookEntries.getElementsByClassName('book-row');
    //iterate through all row div entries to match original book element in localStorage
    for(let i = 0; i < bookRows.length; i++) {
        if(bookRows[i] === bookEntry) {
            let index = i;
            //once match is found, send element index outside function 
            function sendIndex() {
                return index;
            }
        }
    }
    let index = sendIndex();
    //call updateObject to update original book object in localStorage with respective values
    /* The retrieved index value is passed as an argument in order to 
     * locate and update the correct book element in localStorage */
    updateObject(index, title, author, genre, statusValue, comments);

    console.log('Update button successful');
}

//add new book object to localStorage
function storeObject(imageSrc, title, author, genre, status, comments) {
    //create book object
    const book = {
        imageSrc, title, author, genre, status, comments
    };
    //add book object to bookArray
    bookArray.push(book);
    //convert bookArray to a JSON string and save it in localStorage with key 'books'
    localStorage.setItem('books', JSON.stringify(bookArray));
}

//remove book object from localStorage
function removeObject(mainContainer) {
    let title = mainContainer.getElementsByClassName('book-entry-title')[0].value;
    let author = mainContainer.getElementsByClassName('book-entry-author')[0].value;
    //find object to remove by matching book title and author values from book div
    for(let i = 0; i < bookArray.length; i++) {
        let bookTitle = bookArray[i].title;
        let bookAuthor = bookArray[i].author;
        if(bookTitle === title && bookAuthor === author) {
            //remove element from array at specified index
            bookArray.splice(i, 1);
            //reset bookArray to update localStorage
            localStorage.setItem('books', JSON.stringify(bookArray));
        }
    }
}

//update existing book object in localStorage 
function updateObject(index, title, author, genre, statusValue, comments) {
    //update element values at specified index
    bookArray[index].title = title.value;
    bookArray[index].author = author.value;
    bookArray[index].genre = genre.value;
    bookArray[index].status = statusValue;
    bookArray[index].comments = comments.value;
    //reset bookArray to update localStorage
    localStorage.setItem('books', JSON.stringify(bookArray));
}
