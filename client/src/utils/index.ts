//字符串首字母大写
export function capitalizeFirstLetter(str: string): string
{
    if (str?.length > 0) {
        return str[0].toUpperCase() + str.slice(1);
    }
    else {
        return str;
    }
}

//数组转十六进制字符串
export function arrayToHexString(arr: Array<number>): string
{
    return arr.map((value) => {
        return value.toString(16).toUpperCase().padStart(2, "0");
    }).join(" ");
}