let emojis = undefined;
let categories = new Set();
let categoryTree = {};
let serverType = "";
let domain = "";

function loadFrom(ele)
{
    if (event.key === 'Enter')
    {
        domain = ele.value;
        readAPI();
    }
}

function readAPI()
{
    if (domain === 'misskey.test')
    {
        onReadAPISuccess(emojis_test);
    } else if (domain === 'mastodon.test')
    {
        onReadAPISuccess2(emojis_test_mstdn);
    } else
    {
        $.ajax({
            type: 'get',
            url: 'https://' + domain + '/api/emojis',
            dataType: 'json',
            success: onReadAPISuccess,
            error: onReadAPIFallback
        })
    }
}

function onReadAPISuccess(result)
{
    emojis = result.emojis;
    serverType = "misskey";
    alert(emojis.length + ' emojis loaded');
    displayEmojis();
}

function onReadAPISuccess2(result)
{
    emojis = result;
    serverType = "mastodon";
    alert(emojis.length + ' emojis loaded');
    displayEmojis();
}

function onReadAPIFallback(request, status, error)
{
    if (request.status === 404)
    {
        // check if the server runs Mastodon
        $.ajax({
            type: 'get',
            url: 'https://' + domain + '/api/v1/custom_emojis',
            dataType: 'json',
            success: onReadAPISuccess2,
            error: onReadAPIFail
        });
    }
}

function onReadAPIFail(request, status, error)
{
    alert('failed to load emojis');
}

function displayEmojis()
{
    // initialize
    $('.card-cloned').remove();
    categories.clear();

    // create emoji cards
    const emojiList = $('#emojiList');
    for (let i = 0; i < emojis.length; i++)
    {
        const emoji = parseEmoji(emojis[i]);

        const cloned = $('#card').clone().removeClass('visually-hidden').addClass('card-cloned');
        cloned.attr('id', 'card-' + emoji.name);
        cloned.find('.my-img')
            .attr('src', emoji.url)
            .attr('alt', ':' + emoji.name + ':');
        cloned.find('.my-code').text(':' + emoji.name + ':');
        cloned.find('.my-category').text(emoji.category);
        cloned.find('.my-aliases').text(emoji.aliases.join(', '));
        emojiList.append(cloned);

        categories.add(emoji.category);
        console.log(emoji.name + ' added');
    }

    // create category menus
    const _categories = [...categories];
    for (let i = 0; i < _categories.length; i++)
    {
        const element = _categories[i];
        let items = element.split(' / ');
        let ptr = categoryTree;
        
        for (let j = 0; j < items.length; j++) {
            const element = items[j];
            
            if (!ptr.hasOwnProperty(element)) {
                ptr[element] = {};
            }
            ptr = ptr[element];
        }
    }
}

function parseEmoji(entry)
{
    let name = undefined;
    let category = undefined;
    let url = undefined;
    let aliases = undefined;
    let visible = true;

    if (serverType === "misskey")
    {
        name = entry.name;
        category = entry.category;
        url = entry.url;
        aliases = entry.aliases;
    } else if (serverType === "mastodon")
    {
        name = entry.shortcode;
        category = entry.category;
        url = entry.url;
        aliases = [];
        visible = entry.visible_in_picker;
    }

    return { name, category, url, aliases, visible };
}