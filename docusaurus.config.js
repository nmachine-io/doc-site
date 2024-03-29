const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/oceanicNext');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'NMachine',
  tagline: 'Dinosaurs are cool',
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // url: 'https://nmachine-io.github.io/documentation-site/',
  url: "https://docs.nmachine.io",
  baseUrl: '/',
  // baseUrl: '/documentation-site/',
  projectName: 'documentation-site',
  organizationName: 'nmachine-io',
  trailingSlash: false,

  themeConfig: {

    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
    },

    algolia: {
      apiKey: 'YOUR_API_KEY',
      indexName: 'YOUR_INDEX_NAME',

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: see doc section below
      appId: 'YOUR_APP_ID',

      // Optional: Algolia search parameters
      searchParameters: {},

      //... other Algolia params
    },

    navbar: {
      title: 'MACHINE',
      logo: {
        alt: 'My Site Logo',
        src: 'https://uploads-ssl.webflow.com/60f53868cd59a339d865d5f7/60f53a4fb13e234185eb4c7f_57038906.png'
      },
      items: [
        // {
        //   type: 'doc',
        //   docId: 'intro',
        //   position: 'left',
        //   label: 'Tutorial',
        // },

        {
          href: 'https://publish.nmachine.io',
          label: 'Publish',
          position: 'right',
        },
        {
          href: 'https://www.nmachine.io',
          label: 'Company',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      // darkTheme: darkCodeTheme,
      // theme: lightCodeTheme
      theme: darkCodeTheme,
      themeConfig: {
        additionalLanguages: ['ruby']
      }
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          remarkPlugins: [ require('remark-import-partial')],
          sidebarPath: require.resolve('./sidebars.js')
        },
        blog: {},
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
