const topicId = parseInt(window.location.pathname.split("/")?.[2]) || 1;
let pageNumber = parseInt(window.location.pathname.split("/")?.[3]) || 1;

function renderMeta(data) {

    const title = document.querySelector("#title");
    title.innerText = `Top posts of topic ${data.name} `;
    const languagesEl = document.createElement("span");
    let languages = data.comments?.[0]?.topic?.from_language_name || data.from_language;
    if (data.learning_language)
        languages += " -> " + (data.learning_language_string || data.learning_language);
    languagesEl.innerText = `(${languages})`;
    languagesEl.classList.add("details");
    title.appendChild(languagesEl)
    const suggestions = document.querySelector(".suggested");
    const ul = document.createElement("ul");
    for (const topic of data.subtopics) {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.innerText = topic.name;
        link.href = `/topic/${topic.id}`;
        link.style.fontWeight = "bold";
        if (topic.id === topicId)
            link.style.color = "gray";
        li.appendChild(link);
        ul.appendChild(li);
    }
    suggestions.appendChild(ul);
    fetchPages(pageNumber);
}

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

function renderPost(post) {
    const container = document.createElement("div");
    const hr = document.createElement("hr");
    hr.style.marginTop = "14px";
    container.appendChild(hr);
    container.appendChild(getAvatar(post.user));
    const thread = document.createElement("div");
    thread.classList.add("post");
    const title = document.createElement("h2");
    const titleLink = document.createElement("a");
    titleLink.innerText = post.title;
    titleLink.href = `/comment/${post.id}`
    title.appendChild(titleLink);
    thread.appendChild(title);
    const details = document.createElement("span");
    details.classList.add("details");
    details.innerText = `${post.love || 0} love, ${post.num_comments || 0} replies, ${post.datetime_string.replace("T"," ")} by ${post.user.fullname}`;
    thread.appendChild(details);
    container.appendChild(thread);

    return container;
}

function renderPosts(data) {
    document.querySelector("#page-number").innerText = `Page ${pageNumber}`;
    if (!data.more)
        document.querySelector("#page-next").classList.add("disabled");

    const siteBody = document.querySelector(".site-body");
    siteBody.innerHTML = "";
    data.comments.forEach(thread => siteBody.appendChild(renderPost(thread)));
    return undefined;
}

fetch(`/data/topics/${topicId}`)
    .then(response => response.json())
    .then(data => renderMeta(data));

function fetchPages(page = 1) {
    history.pushState(null, null, `/topic/${topicId}/${page}`);
    fetch(`/data/pages/topic_${topicId}/top/${page}.json`)
        .then(response => response.json())
        .then(data => renderPosts(data));
}

function nextPage() {
    fetchPages(++pageNumber);
    document.querySelector("#page-prev").classList.remove("disabled");
}


function prevPage() {
    fetchPages(--pageNumber);
    if (pageNumber === 1)
        document.querySelector("#page-prev").classList.add("disabled");
    document.querySelector("#page-next").classList.remove("disabled");
}
