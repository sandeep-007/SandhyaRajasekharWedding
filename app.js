const { useState, useEffect } = React;

const e = React.createElement;

const RSVP_PHONE = "918142147303";
const COMMON_CONTENT_FILE = "content/common.json";
const CONTENT_FILES = {
  english: "content/english.json",
  telugu: "content/telugu.json",
  kannada: "content/kannada.json",
};
const WEDDING_TIMESTAMP = new Date("2026-03-30T11:00:00+05:30").getTime();
const MEDIA_EXTENSIONS = {
  image: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
  video: [".mp4", ".webm", ".mov", ".m4v"],
};

const fetchJson = async (path, fallback = null) => {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return fallback;
    return await response.json();
  } catch (error) {
    return fallback;
  }
};

const getMediaType = (filename = "") => {
  const lower = filename.toLowerCase();
  if (MEDIA_EXTENSIONS.video.some((ext) => lower.endsWith(ext))) return "video";
  if (MEDIA_EXTENSIONS.image.some((ext) => lower.endsWith(ext))) return "image";
  return null;
};

const prettifyCaption = (filename = "") =>
  filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isPlainObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const deepMerge = (base = {}, override = {}) => {
  const result = { ...base };
  Object.keys(override || {}).forEach((key) => {
    const baseValue = result[key];
    const overrideValue = override[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
    } else {
      result[key] = overrideValue;
    }
  });
  return result;
};

const normalizeMediaItems = (items = []) =>
  items
    .map((item) => {
      const filename = item.name || item.src?.split("/").pop() || "";
      const type = item.type || getMediaType(filename);
      if (!type) return null;

      return {
        src: item.src || encodeURI(item.path || `media/${filename}`),
        type,
        caption: item.caption || prettifyCaption(filename),
      };
    })
    .filter(Boolean);

const getGithubPagesRepo = () => {
  const { hostname, pathname } = window.location;
  if (!hostname.endsWith(".github.io")) return null;

  const owner = hostname.split(".")[0];
  const repo = pathname.split("/").filter(Boolean)[0];
  if (!owner || !repo) return null;

  return { owner, repo };
};

const fetchGithubMediaItems = async () => {
  const repoInfo = getGithubPagesRepo();
  if (!repoInfo) return [];

  const response = await fetch(
    `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/media`,
    { cache: "no-store" },
  );
  if (!response.ok) return [];

  const entries = await response.json();
  if (!Array.isArray(entries)) return [];

  return normalizeMediaItems(
    entries.map((entry) => ({
      name: entry.name,
      path: entry.path,
    })),
  );
};

const loadMediaItems = async () => {
  try {
    const githubItems = await fetchGithubMediaItems();
    if (githubItems.length) return githubItems;
  } catch (error) {
    // Fall back to the static manifest for local previews or API failures.
  }

  const manifestItems = await fetchJson("media/manifest.json", []);
  return normalizeMediaItems(Array.isArray(manifestItems) ? manifestItems : []);
};

const scrollToElementWithOffset = (elementId, offset = 24) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
};

const GoldOrnament = ({ className = "" }) =>
  e(
    "div",
    { className: `ornament ${className}` },
    e(
      "svg",
      {
        width: "300",
        height: "30",
        viewBox: "0 0 300 30",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        className: "w-full",
      },
      e("path", {
        d: "M0 15 Q30 0 60 15 Q90 30 120 15 L150 15 L180 15 Q210 0 240 15 Q270 30 300 15",
        stroke: "hsl(40, 65%, 55%)",
        strokeWidth: "1.5",
        fill: "none",
        opacity: "0.6",
      }),
      e("circle", {
        cx: "150",
        cy: "15",
        r: "4",
        fill: "hsl(40, 65%, 55%)",
        opacity: "0.8",
      }),
      e("circle", {
        cx: "130",
        cy: "15",
        r: "2",
        fill: "hsl(40, 65%, 55%)",
        opacity: "0.5",
      }),
      e("circle", {
        cx: "170",
        cy: "15",
        r: "2",
        fill: "hsl(40, 65%, 55%)",
        opacity: "0.5",
      }),
      e("path", {
        d: "M140 8 L150 2 L160 8",
        stroke: "hsl(40, 65%, 55%)",
        strokeWidth: "1",
        fill: "none",
        opacity: "0.6",
      }),
      e("path", {
        d: "M140 22 L150 28 L160 22",
        stroke: "hsl(40, 65%, 55%)",
        strokeWidth: "1",
        fill: "none",
        opacity: "0.6",
      }),
    ),
  );

const HeroSection = ({ onViewDetails, content }) => {
  const scrollToDetails = () => {
    if (onViewDetails) {
      onViewDetails();
      return;
    }
    scrollToElementWithOffset("english-invite", 24);
  };

  const [highlight, setHighlight] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHighlight(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return e(
    "section",
    { className: "hero" },
    e("div", {
      className: "hero-bg",
      style: { backgroundImage: "url('src/assets/hero-bg.jpg')" },
    }),
    e(
      "div",
      { className: "hero-content" },
      e(
        "p",
        {
          className: "font-body text-royal-ivory hero-verse",
          style: {
            opacity: 0.8,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            lineHeight: 1.6,
          },
        },
        content.hero.verse,
        e(
          "span",
          {
            style: {
              display: "block",
              marginTop: "0.5rem",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              color: "hsl(var(--royal-gold) / 0.7)",
            },
          },
          content.hero.verseRef,
        ),
      ),
      e(GoldOrnament, { className: "my-8" }),
      e(
        "p",
        {
          className: "font-display text-royal-gold",
          style: { letterSpacing: "0.3em", textTransform: "uppercase" },
        },
        content.hero.title,
      ),
      e(
        "div",
        { style: { margin: "2rem 0" } },
        e(
          "h1",
          {
            className: "font-script gold-gradient-text",
            style: { fontSize: "clamp(3rem, 7vw, 6rem)" },
          },
          content.hero.brideName,
        ),
        e(
          "p",
          {
            className: "font-body text-royal-ivory",
            style: {
              opacity: 0.6,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              margin: "1rem 0",
            },
          },
          content.hero.subtitle,
        ),
        e(
          "h1",
          {
            className: "font-script gold-gradient-text",
            style: { fontSize: "clamp(3rem, 7vw, 6rem)" },
          },
          content.hero.groomName,
        ),
      ),
      e(GoldOrnament, { className: "my-8" }),
      e(
        "button",
        {
          className: `cta-button ${highlight ? "cta-flicker" : ""}`,
          onClick: scrollToDetails,
        },
        content.hero.cta,
      ),
    ),
  );
};

const LanguageTabs = ({ activeTab, onChange, labels }) =>
  e(
    "div",
    { className: "tabs" },
    [
      { id: "english", label: labels.english },
      { id: "telugu", label: labels.telugu },
      { id: "kannada", label: labels.kannada },
    ].map((tab) =>
      e(
        "button",
        {
          key: tab.id,
          type: "button",
          className: `tab-button ${activeTab === tab.id ? "active" : ""}`,
          onClick: () => onChange(tab.id),
        },
        e("span", { className: "tab-button-label" }, tab.label),
      ),
    ),
  );

const EnglishInvite = ({ content }) =>
  e(
    "section",
    { id: "english-invite", className: "parchment-bg section-padding" },
    e(
      "div",
      { className: "section-max text-center" },
      e(
        "p",
        {
          className: "font-body",
          style: {
            fontSize: "1.2rem",
            marginBottom: "2rem",
            color: "hsl(var(--muted-foreground))",
          },
        },
        content.englishInvite.intro,
      ),
      e(GoldOrnament, { className: "mb-8" }),
      e(
        "h2",
        {
          className: "font-script text-royal-maroon",
          style: { fontSize: "clamp(2.5rem, 6vw, 4rem)" },
        },
        content.englishInvite.brideName,
      ),
      e(
        "p",
        {
          className: "font-body",
          style: {
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            margin: "1.5rem 0",
            color: "hsl(var(--muted-foreground))",
          },
        },
        content.hero.subtitle,
      ),
      e(
        "h2",
        {
          className: "font-script text-royal-maroon",
          style: { fontSize: "clamp(2.5rem, 6vw, 4rem)" },
        },
        content.englishInvite.groomName,
      ),
      e(
        "p",
        {
          className: "font-body",
          style: { color: "hsl(var(--muted-foreground))", marginTop: "1.5rem" },
        },
        content.englishInvite.lineage
          .split("\n")
          .map((line, index) =>
            index === 0 ? line : [e("br", { key: `line-${index}` }), line],
          ),
      ),
      e(GoldOrnament, { className: "my-10" }),
      e(
        "div",
        { className: "section-max", style: { maxWidth: "600px" } },
        e(
          "div",
          { style: { marginBottom: "2rem" } },
          e(
            "h3",
            {
              className: "font-display text-royal-maroon",
              style: { letterSpacing: "0.2em", textTransform: "uppercase" },
            },
            content.englishInvite.weddingBells,
          ),
          e(
            "p",
            { className: "font-body", style: { fontSize: "1.2rem" } },
            content.englishInvite.weddingDate,
          ),
        ),
        e("div", {
          className: "royal-divider",
          style: { width: "12rem", margin: "0 auto 2rem" },
        }),
        e(
          "div",
          { style: { marginBottom: "2rem" } },
          e(
            "h3",
            {
              className: "font-display text-royal-maroon",
              style: { letterSpacing: "0.2em", textTransform: "uppercase" },
            },
            content.englishInvite.venueTitle,
          ),
          e(
            "p",
            { className: "font-body", style: { fontSize: "1.2rem" } },
            content.englishInvite.venueAddress
              .split("\n")
              .map((line, index) =>
                index === 0 ? line : [e("br", { key: `venue-${index}` }), line],
              ),
          ),
        ),
        e("div", {
          className: "royal-divider",
          style: { width: "12rem", margin: "0 auto 2rem" },
        }),
        e(
          "div",
          null,
          e(
            "h3",
            {
              className: "font-display text-royal-maroon",
              style: { letterSpacing: "0.2em", textTransform: "uppercase" },
            },
            content.englishInvite.lunchTitle,
          ),
          e(
            "p",
            { className: "font-body", style: { fontSize: "1.2rem" } },
            content.englishInvite.lunchTime,
          ),
        ),
      ),
      e(GoldOrnament, { className: "my-10" }),
      e(
        "div",
        null,
        e(
          "p",
          {
            className: "font-display text-royal-maroon",
            style: { letterSpacing: "0.15em", textTransform: "uppercase" },
          },
          content.englishInvite.withLove,
        ),
        e(
          "p",
          { className: "font-body", style: { fontSize: "1.2rem" } },
          content.englishInvite.withLoveNames,
        ),
        e(
          "p",
          {
            className: "font-body",
            style: {
              color: "hsl(var(--muted-foreground))",
              fontStyle: "italic",
            },
          },
          content.englishInvite.withLoveNote,
        ),
      ),
    ),
  );

const TeluguInvite = ({ content }) =>
  e(
    "section",
    {
      className: "bg-royal-maroon section-padding",
      style: { position: "relative", overflow: "hidden" },
    },
    e(
      "div",
      {
        className: "section-max text-center",
        style: { position: "relative", zIndex: 1 },
      },
      e(
        "p",
        {
          className: "font-telugu text-royal-gold",
          style: { opacity: 0.7, marginBottom: "0.5rem" },
        },
        content.teluguInvite.verse,
      ),
      e(
        "p",
        {
          className: "font-body text-royal-gold",
          style: { opacity: 0.5, fontSize: "0.8rem", letterSpacing: "0.2em" },
        },
        content.teluguInvite.verseRef,
      ),
      e(GoldOrnament, { className: "my-8" }),
      e(
        "h2",
        {
          className: "font-telugu text-royal-gold",
          style: { letterSpacing: "0.2em" },
        },
        content.teluguInvite.title,
      ),
      e(
        "p",
        {
          className: "font-telugu text-royal-ivory",
          style: { opacity: 0.8, marginTop: "1.5rem" },
        },
        content.teluguInvite.subtitle,
      ),
      e(
        "h3",
        {
          className: "font-script gold-gradient-text",
          style: { fontSize: "clamp(2.5rem, 6vw, 3.5rem)" },
        },
        content.teluguInvite.brideName,
      ),
      e(
        "p",
        { className: "font-telugu text-royal-ivory", style: { opacity: 0.6 } },
        content.teluguInvite.brideLine,
      ),
      e(
        "p",
        {
          className: "font-telugu text-royal-ivory",
          style: { opacity: 0.7, margin: "1rem 0" },
        },
        content.teluguInvite.groomLine,
      ),
      e(
        "p",
        { className: "font-telugu text-royal-ivory", style: { opacity: 0.5 } },
        content.teluguInvite.lineage,
      ),
      e("div", {
        className: "royal-divider",
        style: { width: "12rem", margin: "2rem auto" },
      }),
      e(
        "div",
        { style: { display: "grid", gap: "1.5rem" } },
        e(
          "div",
          null,
          e(
            "h3",
            { className: "font-telugu text-royal-gold" },
            content.teluguInvite.timeTitle,
          ),
          e(
            "p",
            {
              className: "font-telugu text-royal-ivory",
              style: { opacity: 0.8 },
            },
            content.teluguInvite.timeDetails
              .split("\n")
              .map((line, index) =>
                index === 0 ? line : [e("br", { key: `time-${index}` }), line],
              ),
          ),
        ),
        e("div", {
          className: "royal-divider",
          style: { width: "8rem", margin: "0 auto" },
        }),
        e(
          "div",
          null,
          e(
            "h3",
            { className: "font-telugu text-royal-gold" },
            content.teluguInvite.venueTitle,
          ),
          e(
            "p",
            {
              className: "font-telugu text-royal-ivory",
              style: { opacity: 0.8 },
            },
            content.teluguInvite.venueDetails
              .split("\n")
              .map((line, index) =>
                index === 0 ? line : [e("br", { key: `venue-${index}` }), line],
              ),
          ),
        ),
        e("div", {
          className: "royal-divider",
          style: { width: "8rem", margin: "0 auto" },
        }),
        e(
          "div",
          null,
          e(
            "h3",
            { className: "font-telugu text-royal-gold" },
            content.teluguInvite.lunchTitle,
          ),
          e(
            "p",
            {
              className: "font-telugu text-royal-ivory",
              style: { opacity: 0.8 },
            },
            content.teluguInvite.lunchDetails,
          ),
        ),
      ),
      e(GoldOrnament, { className: "my-8" }),
      e(
        "div",
        null,
        e(
          "p",
          { className: "font-telugu text-royal-gold" },
          content.teluguInvite.inviteTitle,
        ),
        e(
          "p",
          {
            className: "font-telugu text-royal-ivory",
            style: { opacity: 0.9 },
          },
          content.teluguInvite.inviteNames,
        ),
        e(
          "p",
          {
            className: "font-telugu text-royal-ivory",
            style: { opacity: 0.5, fontStyle: "italic" },
          },
          content.teluguInvite.inviteNote,
        ),
      ),
    ),
  );

const KannadaInvite = ({ content }) =>
  e(
    "section",
    {
      className: "bg-royal-saffron section-padding",
      style: { position: "relative", overflow: "hidden" },
    },
    e(
      "div",
      {
        className: "section-max text-center",
        style: { position: "relative", zIndex: 1 },
      },
      e(
        "p",
        {
          className: "font-telugu text-royal-gold",
          style: { opacity: 0.7, marginBottom: "0.5rem" },
        },
        content.kannadaInvite.verse,
      ),
      e(
        "p",
        {
          className: "font-body text-royal-gold",
          style: { opacity: 0.5, fontSize: "0.8rem", letterSpacing: "0.2em" },
        },
        content.kannadaInvite.verseRef,
      ),
      e(GoldOrnament, { className: "my-8" }),
      e(
        "h2",
        {
          className: "font-telugu text-royal-gold",
          style: { letterSpacing: "0.2em" },
        },
        content.kannadaInvite.title,
      ),
      e(
        "p",
        {
          className: "font-telugu text-royal-ivory",
          style: { opacity: 0.8, marginTop: "1.5rem" },
        },
        content.kannadaInvite.subtitle,
      ),
      e(
        "h3",
        {
          className: "font-script gold-gradient-text",
          style: { fontSize: "clamp(2.5rem, 6vw, 3.5rem)" },
        },
        content.kannadaInvite.brideName,
      ),
      e(
        "p",
        { className: "font-telugu text-royal-ivory", style: { opacity: 0.6 } },
        content.kannadaInvite.brideLine,
      ),
      e(
        "p",
        {
          className: "font-telugu text-royal-ivory",
          style: { opacity: 0.7, margin: "1rem 0" },
        },
        content.kannadaInvite.groomLine,
      ),
      e(
        "p",
        { className: "font-telugu text-royal-ivory", style: { opacity: 0.5 } },
        content.kannadaInvite.lineage,
      ),
      e("div", {
        className: "royal-divider",
        style: { width: "12rem", margin: "2rem auto" },
      }),
      e(
        "div",
        { style: { display: "grid", gap: "1.5rem" } },
        e(
          "div",
          null,
          e(
            "h3",
            { className: "font-telugu text-royal-gold" },
            content.kannadaInvite.timeTitle,
          ),
          e(
            "p",
            {
              className: "font-telugu text-royal-ivory",
              style: { opacity: 0.8 },
            },
            content.kannadaInvite.timeDetails
              .split("\n")
              .map((line, index) =>
                index === 0 ? line : [e("br", { key: `time-${index}` }), line],
              ),
          ),
        ),
        e("div", {
          className: "royal-divider",
          style: { width: "8rem", margin: "0 auto" },
        }),
        e(
          "div",
          null,
          e(
            "h3",
            { className: "font-telugu text-royal-gold" },
            content.kannadaInvite.venueTitle,
          ),
          e(
            "p",
            {
              className: "font-telugu text-royal-ivory",
              style: { opacity: 0.8 },
            },
            content.kannadaInvite.venueDetails
              .split("\n")
              .map((line, index) =>
                index === 0 ? line : [e("br", { key: `venue-${index}` }), line],
              ),
          ),
        ),
        e("div", {
          className: "royal-divider",
          style: { width: "8rem", margin: "0 auto" },
        }),
        e(
          "div",
          null,
          e(
            "h3",
            { className: "font-telugu text-royal-gold" },
            content.kannadaInvite.lunchTitle,
          ),
          e(
            "p",
            {
              className: "font-telugu text-royal-ivory",
              style: { opacity: 0.8 },
            },
            content.kannadaInvite.lunchDetails,
          ),
        ),
      ),
      e(GoldOrnament, { className: "my-8" }),
      e(
        "div",
        null,
        e(
          "p",
          { className: "font-telugu text-royal-gold" },
          content.kannadaInvite.inviteTitle,
        ),
        e(
          "p",
          {
            className: "font-telugu text-royal-ivory",
            style: { opacity: 0.9 },
          },
          content.kannadaInvite.inviteNames,
        ),
        e(
          "p",
          {
            className: "font-telugu text-royal-ivory",
            style: { opacity: 0.5, fontStyle: "italic" },
          },
          content.kannadaInvite.inviteNote,
        ),
      ),
    ),
  );

const CountdownSection = ({ content }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isComplete, setIsComplete] = useState(Date.now() >= WEDDING_TIMESTAMP);

  useEffect(() => {
    let timer = null;

    const tick = () => {
      const diff = WEDDING_TIMESTAMP - Date.now();
      if (diff <= 0) {
        setIsComplete(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (timer) clearInterval(timer);
        return;
      }

      setIsComplete(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    tick();
    timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: content.countdown.units.days, value: timeLeft.days },
    { label: content.countdown.units.hours, value: timeLeft.hours },
    { label: content.countdown.units.minutes, value: timeLeft.minutes },
    { label: content.countdown.units.seconds, value: timeLeft.seconds },
  ];

  return e(
    "section",
    { className: "parchment-bg section-padding" },
    e(
      "div",
      { className: "section-max text-center" },
      e(
        "h2",
        {
          className: "font-display text-royal-maroon",
          style: { letterSpacing: "0.2em", textTransform: "uppercase" },
        },
        content.countdown.title,
      ),
      e(
        "p",
        {
          className: "font-body",
          style: {
            color: "hsl(var(--muted-foreground))",
            marginBottom: "2.5rem",
          },
        },
        content.countdown.subtitle,
      ),
      isComplete
        ? e(
            "div",
            {
              className: "royal-border",
              style: {
                padding: "2rem",
                maxWidth: "24rem",
                margin: "0 auto",
                textAlign: "center",
              },
            },
            e(
              "div",
              {
                className: "font-display text-royal-maroon",
                style: {
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                },
              },
              content.countdown.completed || "Married!",
            ),
          )
        : e(
            "div",
            { className: "grid-countdown" },
            units.map((unit) =>
              e(
                "div",
                {
                  key: unit.label,
                  className: "royal-border",
                  style: {
                    padding: "1.5rem",
                    minWidth: "120px",
                    textAlign: "center",
                  },
                },
                e(
                  "div",
                  {
                    className: "font-display text-royal-maroon",
                    style: { fontSize: "2rem" },
                  },
                  String(unit.value).padStart(2, "0"),
                ),
                e(
                  "div",
                  {
                    className: "font-body",
                    style: {
                      fontSize: "0.75rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "hsl(var(--muted-foreground))",
                    },
                  },
                  unit.label,
                ),
              ),
            ),
          ),
    ),
  );
};

const MemoryWallSection = ({ mediaItems, content }) => {
  const [showAll, setShowAll] = useState(false);
  const [isCompact, setIsCompact] = useState(() => window.innerWidth <= 768);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!activeImage) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveImage(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeImage]);

  useEffect(() => {
    if (!mediaItems.length) return;

    const preloadImages = () => {
      mediaItems.slice(0, 10).forEach((item) => {
        if (item.type === "image") {
          const img = new Image();
          img.src = item.src;
        }
      });
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(preloadImages);
    } else {
      setTimeout(preloadImages, 2000);
    }
  }, [mediaItems]);

  const previewCandidates = mediaItems.filter((item) => item.type === "image");

  const baseItems = previewCandidates.length ? previewCandidates : mediaItems;

  const previewItems = isCompact
    ? baseItems.slice(0, 3)
    : baseItems.slice(0, 8);
  const renderMediaCard = (item, key) =>
    e(
      "div",
      { key, className: "memory-card" },
      item.type === "video"
        ? e("video", {
            src: item.src,
            controls: true,
            preload: "metadata",
            playsInline: true,
          })
        : e(
            "button",
            {
              type: "button",
              className: "memory-image-button",
              onClick: () => setActiveImage(item),
              "aria-label": `Open ${item.caption}`,
            },
            e("img", {
              src: item.src,
              alt: item.caption,
              loading: "lazy",
              decoding: "async",
              fetchPriority: "low",
            }),
          ),
      e("div", { className: "memory-caption" }, item.caption),
    );

  return e(
    React.Fragment,
    null,
    e(
      "section",
      { className: "parchment-bg section-padding", id: "memory-wall" },
      e(
        "div",
        { className: "section-max" },
        e(
          "div",
          { className: "memory-header" },
          e(
            "h2",
            {
              className: "font-display text-royal-maroon",
              style: { letterSpacing: "0.2em", textTransform: "uppercase" },
            },
            content.memoryWall.title,
          ),
          e(
            "a",
            {
              href: "#memory-wall",
              className: "memory-link",
              onClick: (event) => {
                event.preventDefault();
                setShowAll((current) => !current);
              },
            },
            showAll
              ? content.memoryWall.showPreview
              : content.memoryWall.viewAll,
          ),
        ),
        e(
          "p",
          {
            className: "font-body",
            style: {
              color: "hsl(var(--muted-foreground))",
              marginBottom: "2.5rem",
            },
          },
          content.memoryWall.note,
        ),
        mediaItems.length
          ? showAll
            ? e(
                "div",
                { className: "memory-wall" },
                mediaItems.map((item) => renderMediaCard(item, item.src)),
              )
            : isCompact
              ? e(
                  "div",
                  { className: "memory-wall compact" },
                  previewItems.map((item, index) =>
                    renderMediaCard(item, `${item.src}-${index}`),
                  ),
                )
              : // isCompact
                //   ? e(
                //       "div",
                //       {
                //         className: "memory-mobile-placeholder font-body",
                //         style: { color: "hsl(var(--muted-foreground))" },
                //       },
                //       content.memoryWall.viewAll,
                //     )
                e(
                  "div",
                  {
                    className: `memory-wall preview${isCompact ? " compact" : ""}`,
                  },
                  e(
                    "div",
                    { className: "memory-track" },
                    [...previewItems, ...previewItems].map((item, index) =>
                      item.type === "video"
                        ? e(
                            "div",
                            {
                              key: `${item.src}-${index}`,
                              className: "memory-card",
                            },
                            e("video", {
                              src: item.src,
                              muted: true,
                              loop: true,
                              autoPlay: true,
                              playsInline: true,
                              preload: "metadata",
                            }),
                            e(
                              "div",
                              { className: "memory-caption" },
                              item.caption,
                            ),
                          )
                        : renderMediaCard(item, `${item.src}-${index}`),
                    ),
                  ),
                )
          : e(
              "p",
              {
                className: "font-body",
                style: { color: "hsl(var(--muted-foreground))" },
              },
              content.memoryWall.empty,
            ),
      ),
    ),
    activeImage &&
      e(
        "div",
        {
          className: "memory-lightbox",
          onClick: () => setActiveImage(null),
        },
        e(
          "button",
          {
            type: "button",
            className: "memory-lightbox-close",
            onClick: () => setActiveImage(null),
            "aria-label": "Close image preview",
          },
          "X",
        ),
        e(
          "div",
          {
            className: "memory-lightbox-content",
            onClick: (event) => event.stopPropagation(),
          },
          e("img", {
            src: activeImage.src,
            alt: activeImage.caption,
            className: "memory-lightbox-image",
          }),
        ),
      ),
  );
};

const VenueSection = ({ content }) =>
  e(
    "section",
    {
      className: "parchment-bg section-padding",
      style: { position: "relative" },
    },
    e(
      "div",
      { className: "section-max text-center" },
      e(
        "h2",
        {
          className: "font-display text-royal-maroon",
          style: { letterSpacing: "0.2em", textTransform: "uppercase" },
        },
        content.venue.weddingTitle,
      ),
      e(
        "p",
        {
          className: "font-body",
          style: { color: "hsl(var(--muted-foreground))" },
        },
        content.venue.weddingLocation,
      ),
      e(
        "div",
        {
          className: "royal-border",
          style: { margin: "2rem auto", overflow: "hidden" },
        },
        e("iframe", {
          src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.2!2d80.4!3d16.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDQyJzAwLjAiTiA4MMKwMjQnMDAuMCJF!5e0!3m2!1sen!2sin!4v1",
          width: "100%",
          height: "350",
          style: { border: 0 },
          allowFullScreen: true,
          loading: "lazy",
          referrerPolicy: "no-referrer-when-downgrade",
          title: "Wedding Venue Location",
        }),
      ),
      e(
        "a",
        {
          href: "https://www.google.com/maps/search/MG+Convention+Kanchikacherla+Andhra+Pradesh+521180",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "cta-button",
        },
        content.venue.directionsLabel,
      ),
    ),
  );

const RSVPSection = ({ content }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = encodeURIComponent(
      `Wedding RSVP\nName: ${formData.fullName}\nPhone: ${formData.phone}\nMessage: ${formData.message}`,
    );
    window.open(`https://wa.me/${RSVP_PHONE}?text=${text}`, "_blank");
    setSubmitted(true);
  };

  if (submitted) {
    return e(
      "section",
      { className: "parchment-bg section-padding", id: "rsvp" },
      e(
        "div",
        { className: "section-max text-center" },
        e(GoldOrnament, { className: "mb-6" }),
        e(
          "h2",
          {
            className: "font-display text-royal-maroon",
            style: { fontSize: "2rem" },
          },
          content.rsvp.thankYouTitle,
        ),
        e(
          "p",
          {
            className: "font-body",
            style: { color: "hsl(var(--muted-foreground))" },
          },
          content.rsvp.thankYouNote,
        ),
        e(GoldOrnament, { className: "mt-6" }),
      ),
    );
  }

  return e(
    "section",
    { className: "parchment-bg section-padding", id: "rsvp" },
    e(
      "div",
      { className: "section-max" },
      e(
        "div",
        { className: "text-center", style: { marginBottom: "2rem" } },
        e(
          "h2",
          {
            className: "font-display text-royal-maroon",
            style: { letterSpacing: "0.2em", textTransform: "uppercase" },
          },
          content.rsvp.title,
        ),
        e(
          "p",
          {
            className: "font-body",
            style: { color: "hsl(var(--muted-foreground))" },
          },
          content.rsvp.subtitle,
        ),
      ),
      e(
        "form",
        { className: "rsvp-form", onSubmit: handleSubmit },
        e(
          "div",
          { style: { marginBottom: "1rem" } },
          e("input", {
            type: "text",
            required: true,
            maxLength: 40,
            placeholder: content.rsvp.fullNamePlaceholder,
            value: formData.fullName,
            onChange: (event) =>
              setFormData({
                ...formData,
                fullName: event.target.value.slice(0, 40),
              }),
          }),
        ),
        e(
          "div",
          { style: { marginBottom: "1rem" } },
          e("input", {
            type: "tel",
            required: true,
            inputMode: "numeric",
            maxLength: 10,
            pattern: "[0-9]{10}",
            placeholder: content.rsvp.phonePlaceholder,
            value: formData.phone,
            onChange: (event) =>
              setFormData({
                ...formData,
                phone: event.target.value.replace(/\D/g, "").slice(0, 10),
              }),
          }),
        ),
        e(
          "p",
          {
            className: "font-body rsvp-note",
            style: { color: "hsl(var(--muted-foreground))" },
          },
          content.rsvp.mailNote,
        ),
        e(
          "div",
          { style: { marginBottom: "1rem" } },
          e("textarea", {
            placeholder: content.rsvp.messagePlaceholder,
            rows: 3,
            maxLength: 100,
            value: formData.message,
            onChange: (event) =>
              setFormData({
                ...formData,
                message: event.target.value.slice(0, 100),
              }),
          }),
        ),
        e(
          "div",
          { className: "text-center" },
          e(
            "button",
            { className: "btn-primary", type: "submit" },
            content.rsvp.submit,
          ),
        ),
      ),
    ),
  );
};

const Footer = ({ content }) =>
  e(
    "footer",
    { className: "footer" },
    e(GoldOrnament, { className: "mb-6" }),
    e(
      "p",
      {
        className: "font-script gold-gradient-text",
        style: { fontSize: "2.5rem" },
      },
      content.footer.names,
    ),
    e(
      "p",
      {
        className: "font-body",
        style: {
          color: "hsl(var(--royal-ivory) / 0.5)",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        },
      },
      content.footer.date,
    ),
    e(GoldOrnament, { className: "mt-6" }),
  );

const App = () => {
  const [activeTab, setActiveTab] = useState("english");
  const [showDetails, setShowDetails] = useState(false);
  const [contentMap, setContentMap] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    if (showDetails) {
      scrollToElementWithOffset("language-tabs", 28);
    }
  }, [showDetails]);

  useEffect(() => {
    const loadAll = async () => {
      const [common, english, telugu, kannada, media] = await Promise.all([
        fetchJson(COMMON_CONTENT_FILE, {}),
        fetchJson(CONTENT_FILES.english, {}),
        fetchJson(CONTENT_FILES.telugu, {}),
        fetchJson(CONTENT_FILES.kannada, {}),
        loadMediaItems(),
      ]);
      const mergedContent = {
        english: deepMerge(common, english),
        telugu: deepMerge(common, telugu),
        kannada: deepMerge(common, kannada),
      };
      setContentMap(mergedContent);
      setMediaItems(Array.isArray(media) ? media : []);
    };
    loadAll();
  }, []);

  if (
    !contentMap ||
    !contentMap.english ||
    !contentMap.telugu ||
    !contentMap.kannada
  ) {
    return e(
      "div",
      {
        className: "section-padding text-center font-body",
        style: { color: "hsl(var(--muted-foreground))" },
      },
      "Unable to load invitation content.",
    );
  }

  const activeContent = contentMap[activeTab] || contentMap.english;

  return e(
    "div",
    null,
    e(HeroSection, {
      onViewDetails: () => setShowDetails(true),
      content: activeContent,
    }),
    showDetails &&
      e(
        React.Fragment,
        null,
        e(
          "div",
          {
            id: "language-tabs",
            className: "section-max language-tabs-anchor",
          },
          e(LanguageTabs, {
            activeTab,
            onChange: setActiveTab,
            labels: activeContent.tabs,
          }),
        ),
        activeTab === "english" && e(EnglishInvite, { content: activeContent }),
        activeTab === "telugu" && e(TeluguInvite, { content: activeContent }),
        activeTab === "kannada" && e(KannadaInvite, { content: activeContent }),
        e(CountdownSection, { content: activeContent }),
        e(VenueSection, { content: activeContent }),
        e(MemoryWallSection, { mediaItems, content: activeContent }),
        e(RSVPSection, { content: activeContent }),
        e(Footer, { content: activeContent }),
      ),
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(e(App));
