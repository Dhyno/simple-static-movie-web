
$(".src-icon").click(function(){
    if(!$("#search-menu").value) return;
    makerequest(this.value);
    $("#search-menu").value='';
});

$(".bar").click( function() {
    $("nav").toggleClass("nav-active");
    $(this).toggleClass("bar-active");
});

$("#search-menu").change(function(){
    $("#wait").html(makeDefault.found);
    makerequest(this.value);
    this.value='';
});

$(".hero-box button").click( () => {
    $(".modal-box").css("display","flex");
    changeModal(); 
});

$("#modal").click(function(){
    $(this).css("display","none");
});

//for dynamic load page
$(document).on('click','.list-box button' ,function(){

    if(makeDefault.current_ajax===undefined) return;

    $.ajax({
        url: `http://www.omdbapi.com/?apikey=dca61bcc&i=${$(this).parent().parent().attr('id')}`,
        success: result => {
            swapBox( $(this).parent().parent() ,result);
            makeDefault.current_ajax=result;
        }
    });
});


let status;
$(document).on({
    ajaxStart: function(){
        $("#wait").show();
        $(".movie-container").css("display","none");
        $(".container").css("height","100vh");
        $("footer").css("display","none");
    },
    ajaxStop: function(){
        if(status){
            $("#wait").html(makeDefault.not_found);
            $(".container").css("height","100vh");
            $("#wait").show();
            $(".movie-container").css("display","none");
            status=false;
            return;
        }

        $("#wait").hide();
        $(".movie-container").css("display","block");
        $(".container").css("height","auto");
        $("footer").css("display","flex");
    }
});

function makerequest(str_value) {
    $.ajax({
        url: `http://www.omdbapi.com/?apikey=dca61bcc&s=${str_value}`,
        success: result => {
            if(result.Response==="False"){
                status=true;
                return;
            }
            $.ajax({
                url: `http://www.omdbapi.com/?apikey=dca61bcc&i=${result.Search[0].imdbID}`,
                success: get_result =>{
                    changeFirstImage(get_result);
                    getUpdate(result);
                    makeDefault.current_ajax=get_result;
                }
            });
        }
    });
}


function changeFirstImage(_result){
    $(".hero-box").attr('id',_result.imdbID);
    $(".hero-box h1").html(`${filterLength(_result.Title,"title")}<span class="to-transparent">(${_result.Year})</span`);
    $(".hero-box h4").text(filterLength(_result.Genre,"genre")); let change='';
    $("#lrg-img").attr('src',`${change = _result.Poster== "N/A"? "asset/image/failed_img.png": _result.Poster}`);

    if(_result.Rated != "N/A"){
        $(".rate").html(getRate(_result.Ratings[0].Value));
    } else {
       $(".rate").html("<h4 class='unrate'>Unknown Rate</h4>" );
    }
    
}

function getUpdate(get_result) {
    if(!get_result.Search) return;

    let update_box='';
    get_result.Search.forEach( (element,indeks) => {
        let check_poster='';
        if(indeks!=0){
            update_box+=`<div class="list-box" id="${element.imdbID}">
                            <img src="${check_poster=element.Poster=="N/A"? "asset/image/failed_img.png":element.Poster}" class="hero">
                            <div class="detail1">
                                <h1>${element.Title}<span class="to-transparent"> (${element.Year})</span></h1>
                                <button>More</button>
                            </div>
                        </div>`
        }
    });
    $(".list-container").html(update_box);
    $(".count h4").html(`${get_result.Search.length} Movies`);
}

function swapBox(list_box, ajax_material) {

    if(makeDefault.current_ajax===undefined) return;

    //change list box from main box properties
    $(list_box).attr('id',$(".hero-box").attr('id'));
    $(list_box).children(":first").attr('src',$(".hero-box #lrg-img").attr('src'));
    $(".list-box").children().eq(1).children().eq(0).text($(".hero-box h1").text());

    //change main box from ajax 
    changeFirstImage(ajax_material);
}

function changeModal() {

    if(makeDefault.current_ajax===undefined) return;

    let change_content=`<div class="title inbox">
                        <h2>Title: </h2>
                        <h2>${makeDefault.current_ajax.Title}</h2>
                        </div>
                        <div class="release inbox">
                            <h2>Relase: </h2>
                            <h2>${makeDefault.current_ajax.Released}</h2>
                        </div>
                        <div class="actor inbox">
                            <h2>Actor: </h2>
                            <h2>${makeDefault.current_ajax.Actors}</h2>
                        </div>
                        <div class="genre inbox">
                            <h2>Genre: </h2>
                            <h2>${makeDefault.current_ajax.Genre}</h2>
                        </div>
                        <div class="plot inbox">
                            <h2>Plot</h2>
                            <h2>${makeDefault.current_ajax.Plot}</h2>
                        </div>`
    $(".modal-detail").html(change_content); change_content='';
    $("#modal img").attr('src',`${change_content=makeDefault.current_ajax.Poster==="N/A"? "asset/image/failed_img.png": makeDefault.current_ajax.Poster }`);
}

function filterLength(str,type) {
    let result_str='';
    let is_long;
    let indeks_limit=0;

    if(type==="title"){
        is_long=str.length>26 ? true : false;
        indeks_limit=27;
    } else if(type==="genre"){
        is_long=str.length>17 ? true : false;
        indeks_limit=19;
    }

    if(is_long){
        for(let i=0; i<=indeks_limit; i++){
            if(i>indeks_limit-3){
                result_str+='.';
                continue;
            }
            result_str+=str[i];
        }
    } else {
        [...str].map( e => result_str+=e );
    }
    return result_str;
}

function getRate(arg){
    let return_string='';
    let star=parseInt(arg[0]);
    let opacity=parseInt(arg[2]);

    //put star into large image
    for(i=0; i<star; i++){
        if(i%2==0){
            return_string+=`<img src="asset/image/star.png" alt="">`;
        }
    }

    //if rate value div by 2 ==0 add start
    if(star%2) {
        return_string+=`<img src="asset/image/star.png" style="opacity: 0.${opacity};"></img>`;
    }

    return return_string;
}

let makeDefault={
    found: "<h1>Please Wait<span>.</span><span>.</span><span>.</span></h1>",
    not_found: "<h1>Movie Not Found <span>.</span><span>.</span><span>.</span></h1>",
    current_ajax: undefined
}


