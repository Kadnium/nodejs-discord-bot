

const getAllowedArray = (permissions, helpObj, type) => {
    const { namespace, key } = helpObj;
    let returnArray = []
    if (permissions[namespace] != null) {
        if (permissions[namespace][key] != null) {
            returnArray = permissions[namespace][key][type];
        } else {
            returnArray = permissions[namespace][type];
        }
    }
    return returnArray;

}


module.exports = {
    getAllowedArray
}