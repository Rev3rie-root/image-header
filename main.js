const { Plugin } = require('obsidian');

class ImageHeaderPlugin extends Plugin {
  async onload() {
    console.log('Image Header plugin loaded');

    // Add banner to currently active file
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      this.addBanner(activeFile);
    }

    // Add banner whenever a file is opened
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

    const imageName = banner.replace(/\[\[|\]\]/g, '');
    const imageFile = this.app.metadataCache.getFirstLinkpathDest(imageName, file.path);
    if (!imageFile) return;

    const imageUrl = this.app.vault.getResourcePath(imageFile);
    this.insertBannerImage(imageUrl);
  }

  insertBannerImage(imageUrl) {
  const leaf = this.app.workspace.activeLeaf;
  if (!leaf) return;

  const viewContent = leaf.view.containerEl;
  
  // Remove existing banner first
  const existingWrapper = viewContent.querySelector('.image-header-wrapper');
  if (existingWrapper) existingWrapper.remove();

  // Create wrapper and banner
  const bannerWrapper = document.createElement('div');
  bannerWrapper.className = 'image-header-wrapper';
  bannerWrapper.style.width = '100%';      // <-- Add this
  bannerWrapper.style.display = 'block';   // <-- Add this

  const bannerEl = document.createElement('img');
  bannerEl.className = 'image-header-banner';
  bannerEl.src = imageUrl;

  bannerWrapper.appendChild(bannerEl);
  
  // Find view-header and view-content
  const viewHeader = viewContent.querySelector('.view-header');
  const contentEl = viewContent.querySelector('.view-content');
  
  if (viewHeader && contentEl) {
    // Insert between view-header and view-content
    viewHeader.parentElement.insertBefore(bannerWrapper, contentEl);
  } else if (contentEl) {
    // Fallback: insert before view-content
    contentEl.parentElement.insertBefore(bannerWrapper, contentEl);
  }
}
  onunload() {
    console.log('Image Header plugin unloaded');
    document.querySelectorAll('.image-header-wrapper').forEach(wrapper => wrapper.remove());
  }
}

module.exports = ImageHeaderPlugin;
