let emojis = undefined;
let serverType = "";
let domain = "";

function loadFrom(ele) {
    if(event.key === 'Enter') {
        domain = ele.value;
        readAPI();        
    }
}

function readAPI() {
    if (domain === 'misskey.test') {
        onReadAPISuccess(emojis_test);
    } else if (domain === 'mastodon.test') {
        onReadAPISuccess2(emojis_test_mstdn);
    } else {
        $.ajax({
            type: 'get',
            url: 'https://'+ domain +'/api/emojis',
            dataType: 'json',
            success: onReadAPISuccess,
            error: onReadAPIFallback
        })
    }
}

function onReadAPISuccess(result) {
    emojis = result.emojis;
    serverType = "misskey";
    alert(emojis.length + ' emojis loaded');
    displayEmojis();
}

function onReadAPISuccess2(result) {
    emojis = result;
    serverType = "mastodon";
    alert(emojis.length + ' emojis loaded');
    displayEmojis();
}

function onReadAPIFallback(request, status, error) {
    if (request.status === 404) {
        // check if the server runs Mastodon
        $.ajax({
            type: 'get',
            url: 'https://'+ domain +'/api/v1/custom_emojis',
            dataType: 'json',
            success: onReadAPISuccess2,
            error: onReadAPIFail
        });
    }
}

function onReadAPIFail(request, status, error) {
    alert('0 emojis loaded');
}

function displayEmojis() {
    $('.card-cloned').remove();

    let emojiList = $('#emojiList');
    for (let i = 0; i < emojis.length; i++) {
        let emoji = parseEmoji(emojis[i]);

        let cloned = $('#card').clone().removeClass('visually-hidden').addClass('card-cloned');
        cloned.attr('id','card-' + emoji.name);
        cloned.find('.my-img')
            .attr('src', emoji.url)
            .attr('alt', ':' + emoji.name + ':');
        cloned.find('.my-code').text(':' + emoji.name + ':');
        cloned.find('.my-category').text(emoji.category);
        cloned.find('.my-aliases').text(emoji.aliases.join(', '));
        emojiList.append(cloned);

        console.log(emoji.name + ' added');
    }
    
}

function parseEmoji(entry) {
    let name = undefined;
    let category = undefined;
    let url = undefined;
    let aliases = undefined;
    let visible = true;

    if (serverType === "misskey") {
        name = entry.name;
        category = entry.category;
        url = entry.url;
        aliases = entry.aliases;
    } else if (serverType === "mastodon") {
        name = entry.shortcode;
        category = entry.category;
        url = entry.url;
        aliases = [];
        visible = entry.visible_in_picker;
    } 

    return {name, category, url, aliases, visible};
}