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
    // Read frontmatter
    const cache = this.app.metadataCache.getFileCache(file);
    const banner = cache && cache.frontmatter && cache.frontmatter.banner;
    
    if (banner) {
      console.log('Found banner:', banner);
      
      let imageName = banner.replace(/\[\[|\]\]/g, '');
      console.log('Image name:', imageName);
      
      const imageFile = this.app.metadataCache.getFirstLinkpathDest(imageName, file.path);
      
      if (imageFile) {
        console.log('Found image file:', imageFile.path);
        
        const imageUrl = this.app.vault.getResourcePath(imageFile);
        console.log('Image URL:', imageUrl);
        
        this.insertBannerImage(imageUrl);
      } else {
        console.log('Image file not found:', imageName);
      }
    } else {
      console.log('No banner found for:', file.name);
    }
  }

insertBannerImage(imageUrl) {
  const leaf = this.app.workspace.activeLeaf;
  if (!leaf) return;
  
  const viewContent = leaf.view.containerEl;
  console.log('View content:', viewContent);
  
  const contentEl = viewContent.querySelector('.view-content');
  if (!contentEl) {
    console.log('Could not find .view-content');
    return;
  }
  
  const existingBanner = viewContent.querySelector('.image-header-banner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
  const bannerEl = document.createElement('img');
  bannerEl.className = 'image-header-banner';
  bannerEl.src = imageUrl;
  
  contentEl.parentElement.insertBefore(bannerEl, contentEl);
  console.log('Banner inserted');
}
} 
module.exports = ImageHeaderPlugin;