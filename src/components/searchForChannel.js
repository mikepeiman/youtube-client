
const searchForChannel = (searchTerm, result) => {
    let search = searchTerm.toLowerCase()
    let title, res, success
    if (result.items) {
        res = result.items
        console.log(`🚀 ~ file: searchForChannel.js ~ line 7 ~ searchForChannel ~ res`, res)

        res.some(item => {
        console.log(`🚀 ~ file: searchForChannel.js ~ line 10 ~ searchForChannel ~ item`, item)
            if(item.snippet.channelTitle.toLowerCase() == search) {
                success = item
                return success
            }
        })

        // for(let i in res) {
        //     let item = res[i]
        //     console.log(`🚀 ~ file: searchForChannel.js ~ line 9 ~ searchForChannel ~ item.snippet.channelTitle.toLowerCase()   ---  `, item.snippet.channelTitle.toLowerCase())
        //     if (item.snippet.channelTitle.toLowerCase() == search) {
        //         console.log(`Successful search, channel object `, JSON.stringify(item))
        //         success = item
        //         return success
        //     } else {
        //         console.log(`No success finding ${searchTerm}`)
        //     }
        // }

    } else {
        console.log(`ERR ! No items found for search term ${searchTerm}`)
        return "error: no matching results"
    }
    return success
}

export default searchForChannel