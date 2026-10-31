// jQuery 3.7.1 is loaded from CDN before this file.
// $(function () {}) waits for DOM elements before attaching handlers.

$(function () {
    const $poetry = $("#poetry-cards-container");
    const $history = $("#timeline-years");
    const $faq = $("#faqAccordion");

    function showMessage(message) {
        let $toast = $("#custom-toast");

        if (!$toast.length) {
            $toast = $("<div>", {
                id: "custom-toast",
                class: "alert alert-success shadow position-fixed bottom-0 start-50 translate-middle-x mb-4"
            }).attr("role", "status").hide().appendTo("body");
        }

        $toast.stop(true, true)
            .text(message)
            .fadeIn(250)
            .delay(1800)
            .fadeOut(400);
    }

    const timelineData = {
        "1984": [
            "Official Opening",
            "Establishment of the State Museum",
            "On July 9, 1984, the museum officially opened its doors in a historical wooden merchant house built in the late 19th century in Akmolinsk."
        ],
        "1998": [
            "Restoration",
            "Restoration and Development of the Museum",
            "After Astana became the new capital of Kazakhstan, the historical museum building was restored and its collection expanded."
        ],
        "2014": [
            "30th Anniversary",
            "Expansion and Recognition",
            "The museum celebrated its 30th anniversary and continued developing its exhibitions and educational activities."
        ],
        "2024": [
            "Modernization",
            "Digitalization and Interactive Exhibitions",
            "The museum continued introducing modern technologies and interactive ways to present historical materials."
        ]
    };

    $history.on("click", ".timeline-year-btn", function () {
        const $button = $(this);
        const year = $button.attr("data-year");
        const entry = timelineData[year];

        if (!entry) return;

        $button.siblings(".timeline-year-btn")
            .removeClass("btn-success active")
            .addClass("btn-outline-success");

        $button.removeClass("btn-outline-success")
            .addClass("btn-success active");

        $("#timeline-card").stop(true, true).fadeOut(150, function () {
            $("#timeline-badge").text(year);
            $("#timeline-subtitle").text(entry[0]);
            $("#timeline-title").text(entry[1]);
            $("#timeline-desc").text(entry[2]);

            $(this).fadeIn(250);
        });
    });

    // Числа запускаются один раз, когда карточки появляются на экране.
    // .animate() заменяет setInterval, а .text() обновляет число без изменения стилей.
    if ($history.length) {
        const $counters = $history.closest("main").find("p.display-6");
        function animateCounters() {
            const top = $(window).scrollTop(), bottom = top + $(window).height();
            $counters.each(function () {
                const $counter = $(this), y = $counter.offset().top, height = $counter.outerHeight();
                if ($counter.data("counting") || y + height * 0.3 > bottom || y + height * 0.7 < top) return;
                const text = $counter.text().trim(), target = parseInt(text, 10);
                if (Number.isNaN(target)) return;
                $counter.data("counting", true);
                const suffix = text.includes("+") ? "+" : "";
                $({ value: target > 1000 ? target - 40 : 0 }).animate({ value: target }, {
                    duration: 1200,
                    easing: "linear",
                    step: value => $counter.text(Math.floor(value) + suffix),
                    complete: () => $counter.text(target + suffix)
                });
            });
            if ($counters.filter(function () { return !$(this).data("counting"); }).length === 0) {
                $(window).off(".museumCounters");
            }
        }
        $(window).on("scroll.museumCounters resize.museumCounters", animateCounters);
        animateCounters();
    }

    let activeCategory = "all";
    let extraCardsVisible = false;
    let extraCardsCreated = false;
    let currentPoem = "";

    function filterPoems() {
        const query = String($("#poetry-search").val() || "")
            .trim()
            .toLowerCase();

        $poetry.find(".poem-card-col").each(function () {
            const $card = $(this);
            const category = $card.attr("data-category");
            const text = $card.text().toLowerCase();

            const matchesCategory =
                activeCategory === "all" ||
                category === activeCategory;

            const matchesSearch = text.includes(query);

            const allowedExtra =
                !$card.hasClass("extra-poem") ||
                extraCardsVisible;

            if (matchesCategory && matchesSearch && allowedExtra) {
                $card.stop(true, true).slideDown(180);
            } else {
                $card.stop(true, true).slideUp(180);
            }
        });
    }

    $("#poetry-filter-btns").on("click", ".filter-btn", function () {
        const $button = $(this);

        $("#poetry-filter-btns .filter-btn")
            .removeClass("btn-success active")
            .addClass("btn-outline-success");

        $button.removeClass("btn-outline-success")
            .addClass("btn-success active");

        activeCategory = $button.attr("data-category") || "all";

        filterPoems();
    });

    $("#poetry-search").on("input", function () {
        filterPoems();
    });

    // Delegation handles cards appended by Show More; direct binding would miss those future cards.
    $poetry.on("click", ".poem-modal-trigger", function () {
        const $card = $(this);

        const title = $card.attr("data-title") || "";
        const quote = $card.attr("data-kaz") || "";

        $("#poemModalLabel").text(title);
        $("#modal-poem-meta").text($card.attr("data-meta") || "");
        $("#modal-poem-badge").text($card.attr("data-badge") || "");
        $("#modal-poem-quote").text(quote);
        $("#modal-poem-desc").text($card.attr("data-desc") || "");

        currentPoem = quote + " — " + title;
    });

    $("#modal-copy-btn").on("click", function () {
        if (!currentPoem) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(currentPoem)
                .then(function () {
                    showMessage("Text copied successfully!");
                })
                .catch(function () {
                    showMessage("Copy is unavailable.");
                });
        } else {
            showMessage("Clipboard is unavailable.");
        }
    });

    if ($poetry.length) {
        const extraPoems = [
            {
                title: "Kyzyl At",
                category: "social",
                meta: "Poem, 1934",
                quote: "A literary work reflecting the challenges of its historical period.",
                desc: "A poem by Saken Seifullin exploring social issues through literary imagery."
            },
            {
                title: "Aisha",
                category: "lyric",
                meta: "Literary work",
                quote: "A literary work exploring human relationships and personal experiences.",
                desc: "A work associated with Saken Seifullin's literary heritage."
            },
            {
                title: "Zher Kazgandar",
                category: "social",
                meta: "Literary work",
                quote: "A story about work, society, and the lives of ordinary people.",
                desc: "A work exploring social change and the experiences of working people."
            }
        ];

        const $moreSection = $("<div>", {
            class: "text-center my-4"
        });

        const $showMoreButton = $("<button>", {
            type: "button",
            id: "show-more-poems",
            class: "btn btn-success px-4 py-2",
            text: "Show More Poems"
        });

        $moreSection.append($showMoreButton);
        $poetry.after($moreSection);

        function createExtraPoems() {
            $.each(extraPoems, function (index, poem) {
                const $column = $("<div>", {
                    class: "col poem-card-col extra-poem"
                }).attr("data-category", poem.category);

                const $card = $("<div>", {
                    class: "card h-100 shadow-sm border-0 bg-white poem-modal-trigger"
                }).attr({
                    "data-bs-toggle": "modal",
                    "data-bs-target": "#poemModal",
                    "data-title": poem.title,
                    "data-meta": poem.meta,
                    "data-badge": poem.category,
                    "data-kaz": poem.quote,
                    "data-desc": poem.desc
                });

                const $body = $("<div>", {
                    class: "card-body d-flex flex-column"
                });

                const $quote = $("<p>", {
                    class: "fst-italic text-secondary poem-text"
                }).text(poem.quote);

                const $footer = $("<div>", {
                    class: "card-footer bg-light border-top-0"
                });

                const $title = $("<p>", {
                    class: "mb-0 fw-bold text-success poem-title"
                }).text(poem.title);

                const $meta = $("<p>", {
                    class: "mb-0 small text-muted"
                }).text(poem.meta);

                $body.append($quote);
                $footer.append($title, $meta);
                $card.append($body, $footer);
                $column.append($card);

                $column.hide().appendTo($poetry);
            });

            extraCardsCreated = true;
        }

        $moreSection.on("click", "#show-more-poems", function () {
            const $button = $(this);

            if (!extraCardsCreated) {
                createExtraPoems();
            }

            extraCardsVisible = !extraCardsVisible;

            $button.text(
                extraCardsVisible
                    ? "Show Less Poems"
                    : "Show More Poems"
            );

            filterPoems();
        });
    }

    if ($faq.length) {
        $faq.find(".accordion-button").each(function () {
            $(this)
                .removeAttr("data-bs-toggle")
                .removeAttr("data-bs-target");
        });

        $faq.find(".accordion-collapse")
            .removeClass("collapse show")
            .hide();

        $faq.on("click", ".accordion-button", function () {
            const $button = $(this);
            const $item = $button.closest(".accordion-item");
            const $answer = $item.find(".accordion-collapse");

            const opening = !$answer.is(":visible");

            $item.siblings(".accordion-item")
                .find(".accordion-collapse")
                .stop(true, true)
                .slideUp(200);

            $item.siblings(".accordion-item")
                .find(".accordion-button")
                .addClass("collapsed")
                .attr("aria-expanded", "false");

            $answer.stop(true, true).slideToggle(250);

            $button.toggleClass("collapsed", !opening)
                .attr("aria-expanded", String(opening));
        });

        $faq.find(".accordion-button:first").trigger("click");
    }

    const $status = $("#museum-status-badge");

    if ($status.length) {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();

        const closingHour = day === 0 || day === 6 ? 17 : 18;
        const closed = day === 1 || hour < 10 || hour >= closingHour;

        $status
            .removeClass("bg-secondary bg-success bg-danger bg-warning text-dark")
            .addClass(closed ? "bg-warning text-dark" : "bg-success")
            .text(
                day === 1
                    ? "Closed (Monday)"
                    : closed
                        ? "Outside listed hours"
                        : "Within listed hours"
            );
    }

    // Посетитель готовит письмо об ошибке; отправляет его сам в своей почте.
    if ($faq.length) {
        const topics = [
            { id: "phone", label: "Phone", type: "tel", hint: "Correct phone number, if known" },
            { id: "email", label: "Email", type: "email", hint: "Correct email address, if known" },
            { id: "address", label: "Address", type: "text", hint: "Correct address, if known" },
            { id: "map", label: "Map location", type: "url", hint: "Correct map link, if known" }
        ];
        const email = $("a[href^='mailto:']").first().attr("href").slice(7).split("?")[0];
        const $toggle = $("<button>", { type: "button", class: "btn btn-link text-success p-0 small",
            text: "Notice incorrect contact information?", "aria-expanded": "false", "aria-controls": "contact-error-form" });
        const $form = $("<form>", { id: "contact-error-form", class: "border rounded p-3 mt-3 bg-light", novalidate: true }).hide();
        const $kind = $("<select>", { id: "contact-error-kind", class: "form-select form-select-sm", required: true })
            .append($("<option>", { value: "", text: "Choose what needs correcting…", disabled: true, selected: true }));
        topics.forEach(topic => $kind.append($("<option>", { value: topic.id, text: topic.label })));
        const $details = $("<textarea>", { id: "contact-error-details", class: "form-control form-control-sm", rows: 3,
            required: true, minlength: 10, maxlength: 600, placeholder: "Tell us what seems incorrect…" });
        const $fix = $("<input>", { id: "contact-error-fix", class: "form-control form-control-sm", type: "text", maxlength: 200,
            placeholder: "Choose a topic first", disabled: true });
        [[$kind, "What is incorrect?"], [$details, "Describe the problem"], [$fix, "Suggested correction (optional)"]].forEach(([$field, label]) => {
            const id = $field.attr("id"), errorId = id + "-error";
            $field.attr("aria-describedby", errorId);
            $form.append($("<div>", { class: "mb-3" }).append(
                $("<label>", { for: id, class: "form-label small fw-semibold", text: label }), $field,
                $("<div>", { id: errorId, class: "invalid-feedback", role: "alert" })
            ));
        });
        const $draft = $("<a>", { class: "btn btn-success btn-sm", text: "Open email draft ↗" });
        const $preview = $("<div>", { class: "border-top pt-3 mt-3" }).append(
            $("<p>", { class: "small text-success mb-2", role: "status", text: "Your draft is ready. Review and send it in your email app." }), $draft
        ).hide();
        $form.append($("<button>", { type: "submit", class: "btn btn-outline-success btn-sm", text: "Prepare email" }),
            $("<p>", { class: "small text-muted mt-2 mb-0", text: "Nothing is sent from this page. An email app is needed to send your report." }), $preview);
        $faq.after($("<div>", { class: "mt-3" }).append($toggle, $form));
        let attempted = false;
        function checkReport() {
            const kind = $kind.val(), fix = $fix.val().trim();
            let correctionError = "";
            if (fix && kind === "phone" && (!/^\+?[0-9()\s-]+$/.test(fix) || !/^\d{10,15}$/.test(fix.replace(/\D/g, "")))) {
                correctionError = "Enter a phone number with 10–15 digits.";
            } else if (fix && kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fix)) {
                correctionError = "Enter a valid email address.";
            } else if (fix && kind === "address" && fix.length < 5) {
                correctionError = "Enter a more complete address.";
            } else if (fix && kind === "map") {
                try { if (!["https:", "http:"].includes(new URL(fix).protocol)) correctionError = "Use an http or https map link."; }
                catch { correctionError = "Enter a complete map link, starting with https://."; }
            }
            const checks = [
                [$kind, topics.some(topic => topic.id === kind) ? "" : "Choose a topic."],
                [$details, $details.val().trim().length >= 10 ? "" : "Describe the issue in at least 10 characters."],
                [$fix, correctionError]
            ];
            checks.forEach(([$field, error]) => {
                $field.toggleClass("is-invalid", !!error).attr("aria-invalid", String(!!error));
                $field.siblings(".invalid-feedback").text(error);
            });
            return checks.every(([, error]) => !error);
        }
        $toggle.on("click", function () {
            const opening = $(this).attr("aria-expanded") !== "true";
            $(this).attr("aria-expanded", String(opening));
            $form.stop(true, true).slideToggle(200, function () { if (opening) $kind.trigger("focus"); });
        });
        $form.on("input change", "input, select, textarea", function () {
            $preview.hide();
            $draft.removeAttr("href");
            if (this.id === "contact-error-kind") {
                const topic = topics.find(item => item.id === $kind.val());
                $fix.val("").attr({ type: topic.type, placeholder: topic.hint }).prop("disabled", false);
            }
            if (attempted) checkReport();
        });
        $form.on("submit", function (event) {
            // Иначе форма перезагрузит страницу. Для реальной отправки сервер должен повторить проверки.
            event.preventDefault();
            attempted = true;
            $preview.hide();
            if (!checkReport()) { $form.find(".is-invalid:first").trigger("focus"); return; }
            const topic = topics.find(item => item.id === $kind.val());
            const fix = $fix.val().trim();
            const body = `Hello,\n\nI noticed a possible error on the museum Contacts page.\nTopic: ${topic.label}\n\n${$details.val().trim()}${fix ? "\n\nSuggested correction: " + fix : ""}\n\nPlease check this information. Thank you.`;
            $draft.attr("href", `mailto:${email}?subject=${encodeURIComponent("Contact information correction: " + topic.label)}&body=${encodeURIComponent(body)}`);
            $preview.stop(true, true).fadeIn(200);
        });
    }

    $("a[data-copy]").on("click", function () {
        showMessage("Contact: " + $(this).attr("data-copy"));
    });
});
