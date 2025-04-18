const Handlebars = require('handlebars');

module.exports = {
    // İki değeri karşılaştır
    eq: function (a, b) {
        return a === b;
    },

    // Tarihi formatla (gün/ay/yıl)
    formatDate: function(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR');
    },

    // Tarihi ve saati formatla
    formatDateTime: function(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Bir metnin ilk karakterini al
    firstChar: function(text) {
        return text ? text.charAt(0).toUpperCase() : '';
    },

    // Bir sayıyı para birimi olarak formatla
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    },

    // Bir metni belirli bir uzunlukta kes
    truncate: function(text, length) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    // Bir dizinin uzunluğunu al
    length: function(array) {
        return Array.isArray(array) ? array.length : 0;
    },

    // Koşullu operatör (üçlü operatör)
    ifCond: function(v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    },

    // Bir sayıyı yüzde olarak formatla
    formatPercent: function(number) {
        return number ? number.toFixed(1) + '%' : '0%';
    },

    // Bir tarihin geçmiş, bugün veya gelecek olduğunu kontrol et
    dateStatus: function(date) {
        if (!date) return '';
        const now = new Date();
        const d = new Date(date);
        
        if (d.toDateString() === now.toDateString()) return 'today';
        return d < now ? 'past' : 'future';
    },

    // Bir metni büyük harfe çevir
    upper: function(text) {
        return text ? text.toUpperCase() : '';
    },

    // Bir metni küçük harfe çevir
    lower: function(text) {
        return text ? text.toLowerCase() : '';
    },

    // Index'e 1 ekle (each döngülerinde sıra numarası için)
    addOne: function(index) {
        return index + 1;
    },

    // JSON string'ini parse et (Handlebars içinde each ile kullanmak için)
    parseJSON: function(jsonString, options) {
        try {
            const data = JSON.parse(jsonString);
            let result = '';
            if (Array.isArray(data)) {
                data.forEach(item => {
                    result += options.fn(item);
                });
            }
            return result;
        } catch (e) {
            console.error("Handlebars JSON parse error:", e);
            return '';
        }
    },

    // Sayı aralığı oluştur (range helper)
    range: function(min, max, options) {
        let result = '';
        for (let i = min; i <= max; i++) {
            result += options.fn(i);
        }
        return result;
    },

    // Büyüktür veya eşittir kontrolü (gte helper)
    gte: function(v1, v2, options) {
        if (v1 >= v2) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    // Dosya boyutunu formatla (formatBytes helper)
    formatBytes: function(bytes, decimals = 2) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    // Bir dizinin ilk elemanını al (first helper)
    first: function(array) {
        if (Array.isArray(array) && array.length > 0) {
            return array[0];
        }
        return undefined;
    },

    // Metindeki newline karakterlerini <br> etiketine çevir (nl2br helper)
    nl2br: function(text) {
        if (typeof text === 'string') {
             // Handlebars'ın güvenli string mekanizmasını korumak için SafeString kullan
            const escapedText = Handlebars.escapeExpression(text);
            const result = escapedText.replace(/(\r\n|\n\r|\r|\n)/g, '<br>');
            return new Handlebars.SafeString(result);
        }
        return text;
    },

    // Bir dizinin belirtilen sayıdaki elemanını al (limit helper)
    limit: function(array, count) {
        if (!Array.isArray(array)) return [];
        return array.slice(0, count);
    },

    // Temel replace helper (nl2br içinde kullanıldı, doğrudan da kullanılabilir)
    replace: function(string, search, replacement) {
        if (typeof string === 'string') {
            return string.replace(new RegExp(search, 'g'), replacement);
        }
        return string;
    },

    // Temel slice helper (limit içinde kullanıldı, doğrudan da kullanılabilir)
     slice: function(array, start, end) {
        if (Array.isArray(array)) {
            return array.slice(start, end);
        }
        return [];
    },

    // Tarihi YYYY-MM-DD formatına çevir (input[type=date] için)
    formatDateForInput: function(date) {
        if (!date) return '';
        try {
            const d = new Date(date);
             // Tarihin geçerli olup olmadığını kontrol et
             if (isNaN(d.getTime())) return ''; 
            // ISO string'in tarih kısmını al (YYYY-MM-DD)
            return d.toISOString().split('T')[0];
        } catch (e) {
            console.error("Error formatting date for input:", e);
            return '';
        }
    },

    // Dinamik helper'ları kaydetmek için gerekli değil (app.js'de yapıldı)
    // registerDynamicHelpers: function(hbsInstance) { ... }

    // Belirli bir path'e sahip dokümanı dizide bul (lookupDocument helper)
    lookupDocument: function(documents, path, options) {
        if (!Array.isArray(documents) || !path) {
            return options.inverse(this); // Bulunamadı veya parametre eksik
        }
        const found = documents.find(doc => doc.filePath === path);
        if (found) {
            return options.fn(found); // Bulundu, içeriği render et
        } else {
            return options.inverse(this); // Bulunamadı
        }
    },

    // Mevcut yılı döndür (currentYear helper)
    currentYear: function() {
        return new Date().getFullYear();
    },

    // Dizide belirli Bilan aşamasına sahip dokümanları filtrele
    filterDocumentsByPhase: function(documents, ...phasesAndOptions) {
        const options = phasesAndOptions.pop(); // Son argüman options objesi
        const phases = phasesAndOptions;
        if (!Array.isArray(documents)) return options.inverse(this);
        let found = false;
        let result = '';
        documents.forEach(doc => {
            // Eğer phases boşsa veya dokümanın aşaması phases içinde varsa
            if (phases.length === 0 || phases.includes(doc.bilanPhase)) {
                result += options.fn(doc);
                found = true;
            }
        });
         if (!found) { // Eğer hiç eşleşme bulunmazsa else bloğunu çalıştır
            return options.inverse(this);
        }
        return result;
    },

     // Dizide belirli kategorilere sahip anketleri filtrele
    filterQuestionnaires: function(questionnaires, ...categoriesAndOptions) {
        const options = categoriesAndOptions.pop();
        const categories = categoriesAndOptions;
        if (!Array.isArray(questionnaires)) return options.inverse(this);
        let result = '';
        questionnaires.forEach(q => {
            if (categories.includes(q.category)) {
                result += options.fn(q);
            }
        });
        if (!result) {
            return options.inverse(this);
        }
        return result;
    },

    // Bir dizinin belirli bir öğeyi içerip içermediğini kontrol et (if içinde kullanmak için)
    includes: function(array, item, options) {
        if (Array.isArray(array) && array.includes(item)) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },

    // String'i belirtilen ayırıcıya göre böl (split helper)
    split: function(string, separator) {
        if (typeof string === 'string') {
            return string.split(separator);
        }
        return [];
    },

    // String'in başındaki ve sonundaki boşlukları temizle (trim helper)
    trim: function(string) {
        if (typeof string === 'string') {
            return string.trim();
        }
        return string;
    },

    // Bir string'in boş olup olmadığını kontrol et (isNonEmptyString helper)
    isNonEmptyString: function(value) {
        return typeof value === 'string' && value.trim().length > 0;
    },

    // Sayfa özelindeki scriptleri biriktirip layout'ta basmak için
    // Kullanım: {{#addScript}} ...script code... {{/addScript}}
    // Layout'ta: {{{renderScripts}}}
    addScript: function(options) {
        // options.data.root üzerinden res.locals'a eriş
        if (options && options.data && options.data.root && options.data.root.pageScripts) {
             options.data.root.pageScripts.push(options.fn(this));
        }
        return null; 
    },
    renderScripts: function(options) {
        // options.data.root üzerinden res.locals'a eriş
         if (options && options.data && options.data.root && options.data.root.pageScripts) {
            const scripts = options.data.root.pageScripts;
            const result = scripts.join('\n');
            options.data.root.pageScripts = []; // Diziyi temizle
            return new Handlebars.SafeString(result); 
         }
         return ''; // pageScripts bulunamazsa boş string döndür
    },

    // Metnin AI taslağı olup olmadığını kontrol et
    isAIDraft: function(text) {
        return typeof text === 'string' && text.startsWith('[Ébauche');
    },

    // Tarihin durumuna göre CSS sınıfı döndür
    dateStatusClass: function(date) {
        if (!date) return 'bg-secondary'; // Tarih yoksa
        const now = new Date();
        const d = new Date(date);
        now.setHours(0, 0, 0, 0); // Sadece tarihi karşılaştır
        d.setHours(0, 0, 0, 0);

        if (d < now) return 'bg-danger'; // Geçmiş
        if (d.getTime() === now.getTime()) return 'bg-warning text-dark'; // Bugün
        // Yakın gelecek için farklı bir renk olabilir (örn: 7 gün)
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        if (d <= oneWeekFromNow) return 'bg-info'; // Yakın gelecek
        return 'bg-success'; // Uzak gelecek
    },

    // Forfait tipine göre bilgiyi getir (lookupForfait helper) - KALDIRILDI
    // lookupForfait: function(forfaitType, property) { ... },

    // Birden fazla koşuldan herhangi biri doğruysa true döndür (or helper)
    or: function() {
        const options = arguments[arguments.length - 1];
        for (let i = 0; i < arguments.length - 1; i++) {
            if (arguments[i]) { // Eğer argüman truthy ise
                return options.fn(this);
            }
        }
        return options.inverse(this); // Hiçbiri truthy değilse
    },

    // Belirli bir kritere uyan ilk dokümanı bul (findDocument helper)
    // Kullanım: {{#findDocument documents category='CV' phase='Preliminaire'}}
    findDocument: function(documents, options) {
        if (!Array.isArray(documents)) return options.inverse(this);

        const criteria = options.hash; // Helper'a hash olarak geçilen parametreler (örn: category='CV')
        const foundDoc = documents.find(doc => {
            let match = true;
            for (const key in criteria) {
                if (doc[key] !== criteria[key]) {
                    match = false;
                    break;
                }
            }
            return match;
        });

        if (foundDoc) {
            return options.fn(foundDoc);
        } else {
            return options.inverse(this);
        }
    },

    // Saati formatla (HH:mm)
    formatTime: function(date) {
        if (!date) return '';
        const d = new Date(date);
         // Geçerli tarih kontrolü
        if (isNaN(d.getTime())) return ''; 
        return d.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 24 saat formatı
        });
    },

    // Kullanıcının paketinin belirli bir seviyede veya üzerinde olup olmadığını kontrol et
    // Sıralama: Essentiel < Standard < Premium < Entreprise < Admin
    isForfaitOrHigher: function(userForfait, minForfait, options) {
        const forfaitLevels = {
            'Essentiel': 1,
            'Standard': 2,
            'Premium': 3,
            'Entreprise': 4,
            'Admin': 5
        };
        const userLevel = forfaitLevels[userForfait] || 0;
        const minLevel = forfaitLevels[minForfait] || 0;

        if (userLevel >= minLevel) {
            return options.fn(this); // Seviye yeterli veya üstünde
        } else {
            return options.inverse(this); // Seviye yetersiz
        }
    },

    // Bilan ilerleme yüzdesini hesapla
    calculateBilanProgress: function(status, phase) {
        if (status === 'completed') return 100;
        if (status === 'on_hold' || status === 'initial') return 5; // Çok küçük bir başlangıç değeri
        
        // Aktif durumdayken aşamaya göre yüzde belirle
        switch (phase) {
            case 'preliminary':
                return 25;
            case 'investigation':
                return 50;
            case 'conclusion':
                return 75;
            default:
                return 10; // Bilinmeyen bir durum için
        }
    },

    // Kredi log aksiyon kodunu okunabilir etikete çevir
    formatActionLabel: function(actionCode) {
        const labels = {
            'QUESTIONNAIRE_ASSIGN': 'Assignation Questionnaire',
            'DOCUMENT_UPLOAD': 'Téléchargement Document',
            'AI_GENERATE_SYNTHESIS': 'Génération IA - Synthèse',
            'AI_GENERATE_ACTIONPLAN': 'Génération IA - Plan d\'Action',
            // İleride eklenebilecekler:
            'CREDIT_PURCHASE': 'Achat Crédits',
            'ADMIN_ADJUSTMENT': 'Ajustement Admin'
        };
        return labels[actionCode] || actionCode; // Eşleşme yoksa kodu döndür
    },

    // Basit sayfalama helper'ı
    // Kullanım: {{{paginate currentPage totalPages base_url='/some/path?'}}}
    paginate: function(currentPage, totalPages, options) {
        let output = '';
        const baseUrl = options.hash.base_url || '?';
        const maxPagesToShow = options.hash.max_pages || 5; // Ortada kaç sayfa gösterilecek

        currentPage = parseInt(currentPage, 10);
        totalPages = parseInt(totalPages, 10);

        if (totalPages <= 1) {
            return ''; // Tek sayfa varsa gösterme
        }

        output += '<nav aria-label="Page navigation"><ul class="pagination pagination-sm justify-content-center">';

        // Önceki Butonu
        if (currentPage > 1) {
            output += `<li class="page-item"><a class="page-link" href="${baseUrl}page=${currentPage - 1}">Önceki</a></li>`;
        } else {
            output += '<li class="page-item disabled"><span class="page-link">Önceki</span></li>';
        }

        // Sayfa Numaraları
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Eğer sona çok yaklaşıldıysa başlangıcı ayarla
        if (endPage - startPage + 1 < maxPagesToShow) {
             startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
             output += `<li class="page-item"><a class="page-link" href="${baseUrl}page=1">1</a></li>`;
             if (startPage > 2) {
                 output += '<li class="page-item disabled"><span class="page-link">...</span></li>';
             }
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                output += `<li class="page-item active" aria-current="page"><span class="page-link">${i}</span></li>`;
            } else {
                output += `<li class="page-item"><a class="page-link" href="${baseUrl}page=${i}">${i}</a></li>`;
            }
        }
        
        if (endPage < totalPages) {
             if (endPage < totalPages - 1) {
                 output += '<li class="page-item disabled"><span class="page-link">...</span></li>';
             }
             output += `<li class="page-item"><a class="page-link" href="${baseUrl}page=${totalPages}">${totalPages}</a></li>`;
        }


        // Sonraki Butonu
        if (currentPage < totalPages) {
            output += `<li class="page-item"><a class="page-link" href="${baseUrl}page=${currentPage + 1}">Sonraki</a></li>`;
        } else {
            output += '<li class="page-item disabled"><span class="page-link">Sonraki</span></li>';
        }

        output += '</ul></nav>';
        return new Handlebars.SafeString(output);
    },

    // Değişkeni güvenli bir şekilde JSON string'ine çevir
    json: function(context) {
        return JSON.stringify(context || null);
    },

    // Bir soru tipinin seçenek gerektirip gerektirmediğini kontrol et
    isOptionType: function(questionType) {
        return questionType === 'radio' || questionType === 'checkbox';
    },

    // String'i URL encode et
    encodeURI: function(string) {
        if (typeof string === 'string') {
            return encodeURIComponent(string);
        }
        return string;
    },

    // Büyüktür kontrolü (gt helper)
    gt: function(v1, v2, options) {
        if (v1 > v2) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    }
}; 