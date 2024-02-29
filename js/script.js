// import $ from "./jquery-3.7.1"

const postLink = "https://danbooru.donmai.us/posts.json?limit=20&tags=rating:general+"
const tagsLink = "https://danbooru.donmai.us/tags.json?search[order]=count&search[name_matches]="
var tag = ""
var page = 1
var id = 0
var ext = ""


function init()
{
    $("#search-box").keyup(function (e) { 
        loadTags($("#search-box").val())
        if (e.key == "Enter")
        {
            tag = $("#search-box").val()
            page = 1
            loadImages(tag, page)
            return
        } 
    });

    $("#full-screen")
        .click(() => {
            $("#full-screen").fadeOut(300, () =>  $("body").css("overflow", "auto") )
            $("#context-menu").hide(300)
        })
    $("#full-screen-image")
        .on("contextmenu", (e) => {
            e.preventDefault();
            $("#context-menu").toggle(300)

        }
    )
}

async function loadTags(value)
{
    if (value.length == 0)
    {
        $("#tag-list").empty()
        return
    }
    var url = await fetch(`${tagsLink}*${value}*`)
    var JSON = await url.json()

    console.log(JSON)
    $("#tag-list").empty()

    JSON.forEach(element => {
        $("#tag-list").append(`<li class="tag-item">${element.name}</li>`)
    })

    $(".tag-item").click(function (e) { 
        $("#search-box").val(`${e.target.innerText}`).focus()
        $("#tag-list").empty()
        tag = $("#search-box").val()
        page = 1
        loadImages(tag, page)
    });
}

async function loadImages(tag, page)
{
    var url = await fetch(postLink + tag + "&page=" + page)
    var JSON = await url.json()

    console.log(JSON)

    $("#images").empty()

    if (JSON.length == 0)
    {
        $("#images")
            .append(`<h1>Well, that sucks.</h1>
            <p>There's nothing in here! Search a new tag or something...`)
        $("#page").hide()
        return
    }

    JSON.forEach(element => {
        if (element.file_ext != 'jpg' && element.file_ext != 'png' && element.file_ext != 'gif') 
        {
            return
        }

        $("#images")
            .append($(`<img src="${element.file_url}" class="image">`)
                .click(() => { 
                    openFullSize(element.file_url, element)
                })
            )
            
    });

    $("#page").show()
    $("#page-number").text(page)
}

function openFullSize(img, data)
{
    $("#full-screen")
        .fadeIn(300, () => { $("body").css("overflow", "hidden") })
        .css("display", "flex");
    $("#full-screen-image")
        .empty()
        .append(`<img src="${img}" id="full-image">`)
    $("body")
        .css("overflow", "hidden")
    $("#data")
        .empty()
        .append(`
            <p>Artist: ${data.tag_string_artist}</p>
            <p>Characters: ${data.tag_string_character}</p>
            <p>Copyright: ${data.tag_string_copyright}</p>
            <p>File Size: ${((data.file_size) / 1024 ** 2).toFixed(2)} MB</p>
        `)
    id = data.id
    ext = data.file_ext
    console.log(id)
}

function prev()
{
    if (page == 1)
    {
        return
    }
    page -= 1
    loadImages(tag, page)
}

function next()
{
    page += 1
    loadImages(tag, page)
}

async function save()
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", $("#full-image").attr("src"), true);
    xhr.responseType = "blob";
    xhr.onload = function(){
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL(this.response);
        var tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = `${id}.${ext}`;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
    xhr.send();
}

function openBooru()
{
    window.open("https://danbooru.donmai.us/posts/" + id, "_blank")
}

init()