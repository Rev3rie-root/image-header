const { Plugin } = require('obsidian');

class ImageHeaderPlugin extends Plugin {
  async onload() {
    console.log('Image Header plugin loaded');

    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      this.addBanner(activeFile);
    }

    this.registerEvent(
      this.app.workspace.on('file-open', (file) => {
        if (file) {
          this.addBanner(file);
        }
      })
    );
  }

  async addBanner(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    const banner = cache && cache.frontmatter && cache.frontmatter.banner;

    if (!banner) return;

    let imageName = banner.replace(/\[\[|\]\]/g, '');
    const imageFile =
      this.app.metadataCache.getFirstLinkpathDest(imageName, file.path);

    if (!imageFile) return;

    const imageUrl = this.app.vault.getResourcePath(imageFile);
    this.insertBannerImage(imageUrl);
  }

  insertBannerImage(imageUrl) {
  const leaf = this.app.workspace.activeLeaf;
  if (!leaf) return;

  const viewContent = leaf.view.containerEl;
  const contentEl = viewContent.querySelector('.view-content');
  if (!contentEl) return;

  // Remove any existing banner wrapper to avoid duplicates
  const existingWrapper = contentEl.querySelector('.image-header-wrapper');
  if (existingWrapper) existingWrapper.remove();

  // Create a wrapper for the banner
  const bannerWrapper = document.createElement('div');
  bannerWrapper.className = 'image-header-wrapper';

  // Create the banner image
  const bannerEl = document.createElement('img');
  bannerEl.className = 'image-header-banner';
  bannerEl.src = imageUrl;

  // Append image to wrapper
  bannerWrapper.appendChild(bannerEl);

  // Insert the wrapper at the very top of contentEl
  contentEl.insertBefore(bannerWrapper, contentEl.firstChild);
}



  onunload() {
    console.log('Image Header plugin unloaded');

    document
      .querySelectorAll('.image-header-banner')
      .forEach(banner => banner.remove());
  }
}

module.exports = ImageHeaderPlugin;
