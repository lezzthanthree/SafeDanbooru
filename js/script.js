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

    $("#full-screen-image")
        .on("contextmenu", (e) => {
            e.preventDefault();
            $("#context-menu").toggle(300)
        })
        .click(() => {
            $("#full-screen").fadeOut(300, () =>  $("body").css("overflow-y", "auto") )
            $("#context-menu").hide(300)
        })

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
        .fadeIn(300, () => { $("body").css("overflow-x", "hidden") })
        .css("display", "flex");
    $("#full-screen-image")
        .empty()
        .append(`<img src="${img}" id="full-image">`)
    console.log(data.image_width / data.image_height)
    if (data.image_width / data.image_height > 1.8)
    {
        $("#full-screen")
        .css({
            "flex-direction": "column",
        })
        $("#full-screen-image")
            .css({
                width: "90%",
                height: "auto"
            })
        $("#full-image")
            .css({
                width: "100%",
                height: "auto"
            })
    }
    else
    {
        $("#full-screen")
        .css({
            "flex-direction": "row",
        })
        $("#full-screen-image")
        .css({
            width: "auto",
            height: "90%"
        })
        $("#full-image")
            .css({
                width: "auto",
                height: "100%"
            })
    }
    $("body")
        .css("overflow-y", "hidden")
    $("#data")
        .empty()
        .append(`
            <p>Artist: ${data.tag_string_artist}</p>
            <p>Characters: ${data.tag_string_character}</p>
            <p>Copyright: ${data.tag_string_copyright}</p>
            <p>Dimensions: ${data.image_width} x ${data.image_height}</p>
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