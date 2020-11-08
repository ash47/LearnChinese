class CharacterToPinYin {
    constructor() {
        this.cache = {};
    }

    loadVocab(vocab) {
        for(let i=0; i<vocab.length; ++i) {
            const thisItem = vocab[i];

            // Store the reference
            this.cache[thisItem.word] = thisItem;
        }
    }

    fromCharacter(character) {
        if(this.cache.hasOwnProperty(character)) {
            return this.cache[character];
        }

        return null;
    }
}

export default new CharacterToPinYin();
