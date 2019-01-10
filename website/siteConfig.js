const siteConfig = {
  title: 'Fewer', // Title for your website.
  tagline: 'A minimal ORM for Node.js.',
  url: 'https://fewer.netlify.com', // Your website URL
  baseUrl: '/',
  // baseUrl: '/fewer', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'fewer',
  organizationName: 'fewer',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'introduction/getting-started', label: 'Getting Started' },
    { doc: 'api/api-reference', label: 'API' },
    { href: 'https://www.github.com/fewer/fewer', label: 'Github' },
    { page: 'help', label: 'Help' },
    // { blog: true, label: 'Blog' },
  ],

  /* path to images for header/footer */
  headerIcon: 'img/FewerIcon.svg',
  footerIcon: 'img/docusaurus.svg',
  favicon: 'img/FewerIcon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#cc9900',
    secondaryColor: '#205C3B',
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()}`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js', 'https://unpkg.com/quicklink', '/scripts/init.js'],

  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/docusaurus.png',
  twitterImage: 'img/docusaurus.png',
};

module.exports = siteConfig;
