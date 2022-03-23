const threadId = parseInt(window.location.pathname.split("/")?.[2]);

function getAvatar(user) {
    const avatarImg = document.createElement("img");
    avatarImg.classList.add("avatar");
    avatarImg.src = `${user.avatar}/large`;
    avatarImg.alt = user.username;
    avatarImg.loading = "lazy";

    if (user.deactivated)
        avatarImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjYGBg+A8AAQQBAHAgZQsAAAAASUVORK5CYII=";

    const avatarHref = document.createElement("a");
    avatarHref.href = `https://www.duolingo.com/profile/${user.username}`;
    avatarHref.appendChild(avatarImg);

    const avatar = document.createElement("span");
    avatar.classList.add("avatar");
    avatar.appendChild(avatarHref);

    return avatar;
}

function getLanguageEmoji(language) {
    const mappings = {
        "en": "🇺🇸",
        "es": "🇪🇸",
        "fr": "🇫🇷",
        "de": "🇩🇪",
        "ja": "🇯🇵",
        "it": "🇮🇹",
        "ko": "🇰🇷",
        "zh": "🇨🇳",
        "zs": "🇨🇳",
        "ru": "🇷🇺",
        "pt": "🇧🇷",
        "tr": "🇹🇷",
        "dn": "🇳🇱",
        "nl-NL": "🇳🇱",
        "sv": "🇸🇪",
        "ga": "🇮🇪",
        "el": "🇬🇷",
        "he": "🇮🇱",
        "pl": "🇵🇱",
        "nb": "🇳🇴",
        "no-BO": "🇳🇴",
        "vi": "🇻🇳",
        "da": "🇩🇰",
        "hv": "🐉",
        "ro": "🇷🇴",
        "sw": "🟦Swahili",
        "eo": "🟩Esperanto",
        "hu": "🇭🇺",
        "cy": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
        "uk": "🇺🇦",
        "kl": "🖖",
        "tlh": "🖖",
        "cs": "🇨🇿",
        "hi": "🇮🇳",
        "id": "🇮🇩",
        "hw": "🌺Hawaiian",
        "nv": "🟨Navajo",
        "ar": "🇸🇦",
        "ca": "🟥Catalonia",
        "th": "🇹🇭",
        "gn": "🇵🇾",
        "ambassadors": "🧑‍🎓",
        "incubator": "🐣",
        "duolingo": "🦉",
        "troubleshooting": "🔧",
        "educators": "🧑‍🏫",
        "la": "🔴Latin",
        "gd": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
        "fi": "🇫🇮",
        "yi": "🟦Yiddish",
    }
    return mappings[language] || "🏁";
}

function getFlairs(user) {
    const flairs = document.createElement("b");
    if (!user.flair)
        return flairs;
    if (user.flair.is_plus)
        flairs.innerText += ` PLUS`;
    for (const flag of user.flair.level_data) {
        const emoji = getLanguageEmoji(flag.language);
        flairs.innerText += ` ${emoji} ${flag.level}`;
    }
    if (user.flair.streak)
        flairs.innerText += ` 🔥 ${user.flair.streak}`;
    //flairs.innerText += " 🇺🇸 23 🇫🇷 69 🔥 123";
    return flairs;
}

function getPostBody(post) {
    const postBody = document.createElement("div");
    postBody.classList.add("post");

    if (post.title) {
        const title = document.createElement("h2");
        title.innerText = post.title + " ";
        const originalLink = document.createElement("a");
        originalLink.href = post.canonical_url;
        originalLink.innerText = "🔗";
        originalLink.style.fontSize = "16px";
        originalLink.title = "Original URL";
        title.appendChild(originalLink);
        postBody.appendChild(title);
    }

    const username = document.createElement("a");
    username.href = `https://www.duolingo.com/profile/${post.user.username}`;
    username.innerText = post.user.username;
    if (post.user.deactivated)
        username.innerText = "[deactivated user]";
    postBody.appendChild(username);

    const flairs = getFlairs(post.user);
    postBody.appendChild(flairs);

    const postContent = document.createElement("div");
    postContent.innerHTML = post.marked_down_message;
    postBody.appendChild(postContent);

    const timestamp = document.createElement("p");
    timestamp.classList.add("date");
    timestamp.innerText = post.datetime_string.replace("T", " ");
    postBody.appendChild(timestamp);

    return postBody;
}

function renderPostContainer(post) {
    const postContainer = document.createElement("div");
    postContainer.classList.add("post-container");

    const avatar = getAvatar(post.user);
    const postBody = getPostBody(post);
    const postComments = getPostComments(post);

    if (!post.canonical_url)
        postBody.appendChild(postComments);

    postContainer.appendChild(avatar);
    postContainer.appendChild(postBody);
    if (post.canonical_url)
        postContainer.appendChild(postComments);

    return postContainer
}

function getPostComments(post) {
    const comments = document.createElement("div");
    if (post.canonical_url) {
        const title = document.createElement("h2");
        title.innerText = `${post.num_comments} comments`;
        comments.appendChild(title);
        comments.appendChild(document.createElement("hr"));
    }
    for (const comment of post.comments) {
        comments.appendChild(renderPostContainer(comment));
    }
    return comments;
}

function renderSuggestions(post) {
    const suggestions = document.querySelector(".suggested");
    const ul = document.createElement("ul");
    for (const thread of post.related_comments) {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.innerText = thread.title;
        link.href = thread.url;
        link.style.fontWeight = "bold";
        const count = document.createElement("div");
        count.classList.add("count");
        count.innerText = `${thread.num_comments} Comments`;
        li.appendChild(link);
        li.appendChild(count);
        ul.appendChild(li);
    }
    suggestions.appendChild(ul);
}

function renderPost(post) {
    document.title = `${post.title} | Duolingo Forum Archive`;
    const siteBody = document.querySelector(".site-body");
    siteBody.innerHTML = "";
    const crumbs = document.createElement("p");
    crumbs.innerText = `FORUM > TOPIC: ${post.topic.name.toUpperCase()} > ${post.title}`
    siteBody.appendChild(crumbs);
    siteBody.appendChild(document.createElement("hr"));
    const postContainer = renderPostContainer(post);
    siteBody.appendChild(postContainer);
    renderSuggestions(post);
    twemoji.parse(document.body);
    document.querySelectorAll("a").forEach(a => {if (a.href.includes("forum.duolingo.com") && a?.title !== "Original URL") a.href = a.href.replaceAll("forum.duolingo.com", document.location.host)});
}

if (!threadId)
    document.location.href = "/"

fetch(`/data/comments/${threadId}.json`)
    .then(response => response.json())
    .then(data => renderPost(data))
    .catch(error => {
        document.querySelector(".site-body").innerText = `Error: ${error}`;
    });