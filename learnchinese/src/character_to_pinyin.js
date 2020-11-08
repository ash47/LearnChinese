class CharacterToPinYin {
    constructor() {
        this.cache = {};
        this.sideLookups = {};
    }

    loadVocab(vocab) {
        // Process each word
        for(let i=0; i<vocab.length; ++i) {
            const thisItem = vocab[i];
            const theWord = thisItem.word;

            // Store the reference
            this.cache[theWord] = thisItem;

            // if it's more than one character, let's create a lookup
            if(theWord.length > 1) {
                for(let j=0; j<theWord.length; ++j) {
                    const thisChar = theWord[j];

                    if(!this.sideLookups.hasOwnProperty(thisChar)) {
                        this.sideLookups[thisChar] = {};
                    }

                    let pinyinNumber = thisItem.pinyinNumber.split(' ')[j];
                    let pinyinWithTone = thisItem.pinyinWithTone.split(' ')[j];
                    let pinyinWithoutTone = thisItem.pinyinWithoutTone.split(' ')[j];

                    // Point it
                    this.sideLookups[thisChar][theWord] = {
                        word: theWord,
                        thisItem: thisItem,
                        tts: thisItem.tts,
                        pinyinNumber: pinyinNumber,
                        pinyinWithTone: pinyinWithTone,
                        pinyinWithoutTone: pinyinWithoutTone,
                        translations: thisItem.translations,
                        pinyinText: thisItem.pinyinText,
                    };
                }
            }
        }
    }

    fromCharacter(character, fullWord) {
        // Main lookup
        if(this.cache.hasOwnProperty(character)) {
            return this.cache[character];
        }

        // Side lookups
        if(this.sideLookups.hasOwnProperty(character) && fullWord && this.sideLookups[character].hasOwnProperty(fullWord)) {
            return this.sideLookups[character][fullWord];
        }

        return null;
    }

    fromToken(token) {
        // Ensure we have a token
        if(!token) return null;

        let mergedWord = null;
        if(token.hint_table && token.hint_table.headers) {
            mergedWord = token.hint_table.headers.reduce((refWord, thisHeader) => {
                return refWord + thisHeader.token;
            }, '');
        }

        return this.fromCharacter(token.value, mergedWord);
    }
}

export default new CharacterToPinYin();
