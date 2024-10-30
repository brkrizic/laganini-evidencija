export const processArticles = (text) => {
    const articles = [];
    const lines = text.split('\n');

    lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        console.log("parts: ", parts);

        let i = 0;
        while (i < parts.length) {
            // Find the next quantity value
            let nameParts = [];
            let quantity = null;

            while (i < parts.length && isNaN(parts[i])) {
                nameParts.push(parts[i]);
                i++;
            }

            if (i < parts.length && !isNaN(parts[i])) {
                quantity = parts[i];
                i++;
            }

            if (nameParts.length > 0 && quantity !== null) {
                const name = nameParts.join(' ');
                articles.push({ nazivArtikla: name, kolicina: quantity });
            }
        }
    });

    return articles;
};
