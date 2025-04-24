const Handlebars = require('handlebars');

module.exports = {
  // İki değeri karşılaştır
  eq(a, b) {
    return a === b;
  },

  // Tarihi formatla (gün/ay/yıl)
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  },

  // Tarihi ve saati formatla
  formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return (
      `${d.toLocaleDateString('fr-FR')
      } ${
        d.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`
    );
  },

  // Bir metnin ilk karakterini al
  firstChar(text) {
    return text ? text.charAt(0).toUpperCase() : '';
  },

  // Bir sayıyı para birimi olarak formatla
  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  },

  // Bir metni belirli bir uzunlukta kes
  truncate(text, length) {
    if (!text) return '';
    if (text.length <= length) return text;
    return `${text.substring(0, length)}...`;
  },

  // Bir dizinin uzunluğunu al
  length(array) {
    return Array.isArray(array) ? array.length : 0;
  },

  // Koşullu operatör (üçlü operatör)
  ifCond(v1, operator, v2, options) {
    switch (operator) {
      case '==':
      case '===':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '!=':
      case '!==':
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case '<':
        return v1 < v2 ? options.fn(this) : options.inverse(this);
      case '<=':
        return v1 <= v2 ? options.fn(this) : options.inverse(this);
      case '>':
        return v1 > v2 ? options.fn(this) : options.inverse(this);
      case '>=':
        return v1 >= v2 ? options.fn(this) : options.inverse(this);
      case '&&':
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      case '||':
        return v1 || v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  },

  // Bir sayıyı yüzde olarak formatla
  formatPercent(number) {
    return number ? `${number.toFixed(1)}%` : '0%';
  },

  // Bir tarihin geçmiş, bugün veya gelecek olduğunu kontrol et
  dateStatus(date) {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);

    if (d.toDateString() === now.toDateString()) return 'today';
    return d < now ? 'past' : 'future';
  },

  // Bir metni büyük harfe çevir
  upper(text) {
    return text ? text.toUpperCase() : '';
  },

  // Bir metni küçük harfe çevir
  lower(text) {
    return text ? text.toLowerCase() : '';
  },

  // Index'e 1 ekle (each döngülerinde sıra numarası için)
  addOne(index) {
    return index + 1;
  },

  // JSON string'ini parse et (Handlebars içinde each ile kullanmak için)
  parseJSON(jsonString, options) {
    try {
      const data = JSON.parse(jsonString);
      let result = '';
      if (Array.isArray(data)) {
        data.forEach((item) => {
          result += options.fn(item);
        });
      }
      return result;
    } catch (e) {
      console.error('Handlebars JSON parse error:', e);
      return '';
    }
  },

  // Sayı aralığı oluştur (range helper)
  range(min, max, options) {
    let result = '';
    for (let i = min; i <= max; i += 1) {
      result += options.fn(i);
    }
    return result;
  },

  // Büyüktür veya eşittir kontrolü (gte helper)
  gte(v1, v2, options) {
    if (v1 >= v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  // Dosya boyutunu formatla (formatBytes helper)
  formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  },

  // Bir dizinin ilk elemanını al (first helper)
  first(array) {
    if (Array.isArray(array) && array.length > 0) {
      return array[0];
    }
    return undefined;
  },

  // Metindeki newline karakterlerini <br> etiketine çevir (nl2br helper)
  nl2br(text) {
    if (typeof text === 'string') {
      // Handlebars'ın güvenli string mekanizmasını korumak için SafeString kullan
      const escapedText = Handlebars.escapeExpression(text);
      const result = escapedText.replace(/(\r\n|\n\r|\r|\n)/g, '<br>');
      return new Handlebars.SafeString(result);
    }
    return text;
  },

  // Bir dizinin belirtilen sayıdaki elemanını al (limit helper)
  limit(array, count) {
    if (!Array.isArray(array)) return [];
    return array.slice(0, count);
  },

  // Temel replace helper (nl2br içinde kullanıldı, doğrudan da kullanılabilir)
  replace(string, search, replacement) {
    if (typeof string === 'string') {
      return string.replace(new RegExp(search, 'g'), replacement);
    }
    return string;
  },

  // Temel slice helper (limit içinde kullanıldı, doğrudan da kullanılabilir)
  slice(array, start, end) {
    if (Array.isArray(array)) {
      return array.slice(start, end);
    }
    return [];
  },

  // Tarihi YYYY-MM-DD formatına çevir (input[type=date] için)
  formatDateForInput(date) {
    if (!date) return '';
    try {
      const d = new Date(date);
      // Tarihin geçerli olup olmadığını kontrol et
      if (Number.isNaN(d.getTime())) return '';
      // ISO string'in tarih kısmını al (YYYY-MM-DD)
      return d.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date for input:', e);
      return '';
    }
  },

  // Dinamik helper'ları kaydetmek için gerekli değil (app.js'de yapıldı)
  // registerDynamicHelpers: function(hbsInstance) { ... }

  // Belirli bir path'e sahip dokümanı dizide bul (lookupDocument helper)
  lookupDocument(documents, path, options) {
    if (!Array.isArray(documents) || !path) {
      return options.inverse(this); // Bulunamadı veya parametre eksik
    }
    const found = documents.find((doc) => doc.filePath === path);
    if (found) {
      return options.fn(found); // Bulundu, içeriği render et
    }
    return options.inverse(this); // Bulunamadı
  },

  // Mevcut yılı döndür (currentYear helper)
  currentYear() {
    return new Date().getFullYear();
  },

  // Dizide belirli Bilan aşamasına sahip dokümanları filtrele
  filterDocumentsByPhase(documents, ...phasesAndOptions) {
    const options = phasesAndOptions.pop(); // Son argüman options objesi
    const phases = phasesAndOptions;
    if (!Array.isArray(documents)) return options.inverse(this);
    let found = false;
    let result = '';
    documents.forEach((doc) => {
      // Eğer phases boşsa veya dokümanın aşaması phases içinde varsa
      if (phases.length === 0 || phases.includes(doc.bilanPhase)) {
        result += options.fn(doc);
        found = true;
      }
    });
    if (!found) {
      // Eğer hiç eşleşme bulunmazsa else bloğunu çalıştır
      return options.inverse(this);
    }
    return result;
  },

  // Dizide belirli kategorilere sahip anketleri filtrele
  filterQuestionnaires(questionnaires, ...categoriesAndOptions) {
    const options = categoriesAndOptions.pop();
    const categories = categoriesAndOptions;
    if (!Array.isArray(questionnaires)) return options.inverse(this);
    let result = '';
    questionnaires.forEach((q) => {
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
  includes(array, item, options) {
    if (Array.isArray(array) && array.includes(item)) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  // String'i belirtilen ayırıcıya göre böl (split helper)
  split(string, separator) {
    if (typeof string === 'string') {
      return string.split(separator);
    }
    return [];
  },

  // String'in başındaki ve sonundaki boşlukları temizle (trim helper)
  trim(string) {
    if (typeof string === 'string') {
      return string.trim();
    }
    return string;
  },

  // Bir string'in boş olup olmadığını kontrol et (isNonEmptyString helper)
  isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  },

  // Sayfa özelindeki scriptleri biriktirip layout'ta basmak için
  // Kullanım: {{#addScript}} ...script code... {{/addScript}}
  // Layout'ta: {{{renderScripts}}}
  addScript(options) {
    // options.data.root üzerinden res.locals'a eriş
    if (
      options &&
      options.data &&
      options.data.root &&
      options.data.root.pageScripts
    ) {
      options.data.root.pageScripts.push(options.fn(this));
    }
    return null;
  },
  renderScripts(options) {
    // options.data.root üzerinden res.locals'a eriş
    if (
      options &&
      options.data &&
      options.data.root &&
      options.data.root.pageScripts
    ) {
      const scripts = options.data.root.pageScripts;
      const result = scripts.join('\n');
      options.data.root.pageScripts = []; // Diziyi temizle
      return new Handlebars.SafeString(result);
    }
    return ''; // pageScripts bulunamazsa boş string döndür
  },

  // Metnin AI taslağı olup olmadığını kontrol et
  isAIDraft(text) {
    return typeof text === 'string' && text.startsWith('[Ébauche');
  },

  // Tarihin durumuna göre CSS sınıfı döndür
  dateStatusClass(date) {
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

  // Birden fazla koşuldan herhangi biri doğruysa true döndür (or helper - Inline için Düzeltilmiş)
  or() {
    // Check if last argument is options object (from Handlebars)
    const options = arguments[arguments.length - 1];
    const isBlockHelper =
      options &&
      typeof options === 'object' &&
      typeof options.fn === 'function';

    // Determine how many arguments to check (all except options if it's a block helper)
    const argsToCheck = isBlockHelper ? arguments.length - 1 : arguments.length;

    // Check each argument
    for (let i = 0; i < argsToCheck; i += 1) {
      if (arguments[i]) {
        // Herhangi biri truthy ise true döndür
        return isBlockHelper ? options.fn(this) : true;
      }
    }

    // None of the arguments were truthy
    return isBlockHelper ?
      typeof options.inverse === 'function' ?
        options.inverse(this) :
        '' :
      false;
  },

  // AND helper'ı (Inline için Düzeltilmiş)
  and() {
    // Check if last argument is options object (from Handlebars)
    const options = arguments[arguments.length - 1];
    const isBlockHelper =
      options &&
      typeof options === 'object' &&
      typeof options.fn === 'function';

    // Determine how many arguments to check (all except options if it's a block helper)
    const argsToCheck = isBlockHelper ? arguments.length - 1 : arguments.length;

    // Check each argument
    for (let i = 0; i < argsToCheck; i += 1) {
      if (!arguments[i]) {
        // Herhangi biri falsy ise false döndür
        return isBlockHelper ?
          typeof options.inverse === 'function' ?
            options.inverse(this) :
            '' :
          false;
      }
    }

    // All arguments were truthy
    return isBlockHelper ? options.fn(this) : true;
  },

  // NOT helper'ı (basit)
  not(value, options) {
    if (!value) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  // Format markdown text to HTML
  formatMarkdown(text) {
    if (!text) return '';

    // Simple markdown to HTML conversion
    // Headers
    let html = text
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^##### (.*$)/gm, '<h5>$1</h5>');

    // Bold and Italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');

    // Lists
    html = html
      .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>')
      .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
      .replace(/(<\/ul>\s*<ul>)/g, '');

    // Numbered lists
    html = html
      .replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>')
      .replace(/(<\/ol>\s*<ol>)/g, '');

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank">$1</a>',
    );

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return new Handlebars.SafeString(html);
  },

  // Belirli bir kritere uyan ilk dokümanı bul (findDocument helper)
  findDocument(documents, options) {
    if (!Array.isArray(documents)) return options.inverse(this);

    const criteria = options.hash; // Helper'a hash olarak geçilen parametreler (örn: category='CV')
    const foundDoc = documents.find((doc) => {
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
    }
    return options.inverse(this);
  },

  // Saati formatla (HH:mm)
  formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    // Geçerli tarih kontrolü
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24 saat formatı
    });
  },

  // Kullanıcının paketinin belirli bir seviyede veya üzerinde olup olmadığını kontrol et
  // Sıralama: Essentiel < Standard < Premium < Entreprise < Admin
  isForfaitOrHigher(userForfait, requiredForfait, options) {
    console.log(
      `isForfaitOrHigher Check: User='${userForfait}', Required='${requiredForfait}'`,
    );
    if (!userForfait) {
      // console.warn(
      //   'isForfaitOrHigher: userForfait parameter is null or undefined',
      // ); // Uyarı kaldırıldı, helper durumu zaten ele alıyor
      return options.inverse(this); // Treat null/undefined as not meeting requirement
    }
    const levels = ['Free', 'Standard', 'Premium', 'Admin']; // Define hierarchy
    const forfaitLevels = {
      Essentiel: 1,
      Standard: 2,
      Premium: 3,
      Entreprise: 4,
      Admin: 5,
    };

    const userLevel = forfaitLevels[userForfait] || 0;
    const minLevel = forfaitLevels[requiredForfait] || 0;

    const result = userLevel >= minLevel;

    // Handle both block and inline usage
    if (options && typeof options === 'object') {
      if (typeof options.fn === 'function') {
        return result ?
          options.fn(this) :
          typeof options.inverse === 'function' ?
            options.inverse(this) :
            '';
      }
    }

    return result;
  },

  // Bilan ilerleme yüzdesini hesapla
  calculateBilanProgress(status, phase) {
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
  formatActionLabel(actionCode) {
    const labels = {
      QUESTIONNAIRE_ASSIGN: 'Assignation Questionnaire',
      DOCUMENT_UPLOAD: 'Téléchargement Document',
      DOCUMENT_DOWNLOAD: 'Téléchargement Document',
      AI_GENERATE_SYNTHESIS: 'Génération IA - Synthèse',
      AI_GENERATE_ACTIONPLAN: "Génération IA - Plan d'Action",
      CREDIT_PURCHASE: 'Achat Crédits',
      ADMIN_ADJUSTMENT: 'Ajustement Admin',
      ADMIN_FORFAIT_CHANGE: 'Changement de Forfait',
      REFUND: 'Remboursement',
    };
    return labels[actionCode] || actionCode; // Eşleşme yoksa kodu döndür
  },

  // Basit sayfalama helper'ı
  // Kullanım: {{{paginate currentPage totalPages base_url='/some/path?'}}}
  paginate(currentPage, totalPages, options) {
    let output = '';
    const baseUrl = options.hash.base_url || '?';
    const maxPagesToShow = options.hash.max_pages || 5; // Ortada kaç sayfa gösterilecek

    currentPage = parseInt(currentPage, 10);
    totalPages = parseInt(totalPages, 10);

    if (totalPages <= 1) {
      return ''; // Tek sayfa varsa gösterme
    }

    output +=
      '<nav aria-label="Page navigation"><ul class="pagination pagination-sm justify-content-center">';

    // Önceki Butonu
    if (currentPage > 1) {
      output += `<li class="page-item"><a class="page-link" href="${baseUrl}page=${currentPage - 1}">Önceki</a></li>`;
    } else {
      output +=
        '<li class="page-item disabled"><span class="page-link">Önceki</span></li>';
    }

    // Sayfa Numaraları
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Eğer sona çok yaklaşıldıysa başlangıcı ayarla
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      output += `<li class="page-item"><a class="page-link" href="${baseUrl}page=1">1</a></li>`;
      if (startPage > 2) {
        output +=
          '<li class="page-item disabled"><span class="page-link">...</span></li>';
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
        output +=
          '<li class="page-item disabled"><span class="page-link">...</span></li>';
      }
      output += `<li class="page-item"><a class="page-link" href="${baseUrl}page=${totalPages}">${totalPages}</a></li>`;
    }

    // Sonraki Butonu
    if (currentPage < totalPages) {
      output += `<li class="page-item"><a class="page-link" href="${baseUrl}page=${currentPage + 1}">Sonraki</a></li>`;
    } else {
      output +=
        '<li class="page-item disabled"><span class="page-link">Sonraki</span></li>';
    }

    output += '</ul></nav>';
    return new Handlebars.SafeString(output);
  },

  // Değişkeni güvenli bir şekilde JSON string'ine çevir
  json(context) {
    return JSON.stringify(context || null);
  },

  // Bir soru tipinin seçenek gerektirip gerektirmediğini kontrol et
  isOptionType(questionType) {
    return questionType === 'radio' || questionType === 'checkbox';
  },

  // String'i URL encode et
  encodeURI(string) {
    if (typeof string === 'string') {
      return encodeURIComponent(string);
    }
    return string;
  },

  // Büyüktür kontrolü (gt helper)
  gt(v1, v2, options) {
    if (v1 > v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  // Belirtilen sayıda döngü oluştur (times helper) - Sayfalama için
  times(n, block) {
    let accum = '';
    if (n === undefined || n === null || Number.isNaN(parseInt(n, 10))) {
      console.warn('Handlebars Helper "times" received non-numeric value:', n);
      n = 0;
    }
    n = parseInt(n, 10);
    for (let i = 0; i < n; i += 1) {
      accum += block.fn(i);
    }
    return accum;
  },

  // İki sayıyı topla (add helper) - Sayfalama için
  add(a, b) {
    return (parseInt(a, 10) || 0) + (parseInt(b, 10) || 0);
  },

  // İki sayıyı çıkar (subtract helper) - Sayfalama için
  subtract(a, b) {
    return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0);
  },

  // Durum koduna göre Bootstrap badge class'ı ve metni döndür
  statusBadges(status) {
    switch (status) {
      case 'initial':
        return { badge: 'bg-info', text: 'Initial' };
      case 'active':
        return { badge: 'bg-success', text: 'Actif' };
      case 'completed':
        return { badge: 'bg-secondary', text: 'Terminé' };
      case 'on_hold':
        return { badge: 'bg-warning text-dark', text: 'En pause' };
      default:
        return { badge: 'bg-light text-dark', text: status || 'Inconnu' };
    }
  },

  // Aşama koduna göre Bootstrap badge class'ı ve metni döndür
  phaseBadges(phase) {
    switch (phase) {
      case 'preliminary':
        return { badge: 'bg-primary', text: 'Préliminaire' };
      case 'investigation':
        return { badge: 'bg-warning text-dark', text: 'Investigation' };
      case 'conclusion':
        return { badge: 'bg-success', text: 'Conclusion' };
      default:
        return { badge: 'bg-light text-dark', text: phase || 'Inconnu' };
    }
  },

  // Randevu durumuna göre Bootstrap badge class'ı ve metni döndür
  appointmentStatusBadges(status) {
    switch (status) {
      case 'scheduled':
        return { badge: 'bg-primary', text: 'Planifié' };
      case 'completed':
        return { badge: 'bg-success', text: 'Terminé' };
      case 'cancelled':
        return { badge: 'bg-danger', text: 'Annulé' };
      default:
        return { badge: 'bg-secondary', text: status || 'Inconnu' };
    }
  },

  // Randevu durumu için HTML badge döndür
  appointmentStatusBadge(status) {
    const badgeInfo = module.exports.appointmentStatusBadges(status);
    return new Handlebars.SafeString(
      `<span class="badge ${badgeInfo.badge}">${badgeInfo.text}</span>`,
    );
  },

  // Anket durumuna göre Bootstrap badge class'ı ve metni döndür
  questionnaireStatusBadges(status) {
    switch (status) {
      case 'draft':
        return { badge: 'bg-secondary', text: 'Brouillon' }; // Taslak
      case 'pending':
        return { badge: 'bg-warning text-dark', text: 'En attente' }; // Beklemede
      case 'completed':
        return { badge: 'bg-success', text: 'Complété' }; // Tamamlandı
      default:
        return { badge: 'bg-light text-dark', text: status || 'Inconnu' }; // Bilinmiyor
    }
  },
};
