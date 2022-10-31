const path = require("path");

const componentsContentTemplate = path.resolve(
  `./src/templates/ComponentsContentTemplate.tsx`,
);
const overviewContentTemplate = path.resolve(
  `./src/templates/OverviewContentTemplate.tsx`,
);

exports.onCreatePage = async ({ page, actions: { deletePage } }) => {
  const isVanillaExtractFile = page.path.includes(".css");

  if (isVanillaExtractFile) {
    deletePage(page);
  }
};

exports.createPages = async ({ graphql, actions: { createPage } }) => {
  const result = await graphql(`
    query {
      overviews: allMdx(
        filter: { internal: { contentFilePath: { regex: "/overview/" } } }
      ) {
        edges {
          node {
            internal {
              contentFilePath
            }
            frontmatter {
              slug
            }
          }
        }
      }
      components: allMdx(
        filter: { frontmatter: { slug: { regex: "/components/" } } }
      ) {
        nodes {
          internal {
            contentFilePath
          }
          tableOfContents
          frontmatter {
            slug
            description
            title
          }
        }
      }
    }
  `);

  result.data.overviews.edges.forEach(({ node }) => {
    const { slug } = node.frontmatter;
    const { contentFilePath } = node.internal;

    createPage({
      path: slug,
      component: `${overviewContentTemplate}?__contentFilePath=${contentFilePath}`,
      context: {
        slug,
      },
    });
  });

  result.data.components.nodes.forEach((node) => {
    createPage({
      path: node.frontmatter.slug,
      component: `${componentsContentTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        slug: node.frontmatter.slug,
        title: node.frontmatter.title,
        description: node.frontmatter.description,
        activeTab:
          node.frontmatter.slug.split("/")[
            node.frontmatter.slug.split("/")?.length - 1
          ],
      },
    });
  });
};
