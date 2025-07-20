export class TitleFormatado {

    static toTitleCase(text: string): string {
        if (!text) return '';

        const minorWords = ['de', 'do', 'da', 'dos', 'das', 'e', 'em', 'com', 'a', 'o', 'as', 'os', 'por', 'para', 'no', 'na'];

        return text
            .toLowerCase()
            .split(' ')
            .map((word, index) => {
                if (minorWords.includes(word) && index !== 0) return word;
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }

}
