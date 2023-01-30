export const reverse = (s: string): string => {
    var o = '';
    for (var i = s.length - 1; i >= 0; i--)
        o += s[i];
    return o;
}
