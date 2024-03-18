document.addEventListener('DOMContentLoaded', function() {
    var youtubeVideo = document.getElementById("youtube-video");
    var playButton = youtubeVideo.querySelector(".play-button");

    playButton.addEventListener("click", function() {
        var youtubeLink = youtubeVideo.getAttribute("data-youtube-link") + "&cc_load_policy=1&cc_lang_pref=en"; // 添加自动开启字幕和英文字幕优先参数
        var iframe = document.createElement("iframe");
        iframe.className = "embed-responsive-item";
        iframe.src = youtubeLink;
        iframe.title = "YouTube video player";
        iframe.frameborder = "0";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;

        youtubeVideo.innerHTML = ""; // 清空容器
        youtubeVideo.appendChild(iframe);
    });
});