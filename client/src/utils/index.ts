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

//指针转十六进制数组
export function getByteDataByPointer(offset: number): number[]
{
    const res = [];

    if (offset < 0x2000000) offset += 0x8000000;
    for (let i = 0; i < 4; i++, offset >>= 8) {
        res.push(offset % 0x100);
    }

    return res;
}