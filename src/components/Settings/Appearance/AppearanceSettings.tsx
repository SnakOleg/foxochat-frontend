import { observer } from "mobx-react";
import appStore from "@store/app";
import ColorPicker from "./ColorPicker";
import * as styles from "./AppearanceSettings.module.scss";

export default observer(function AppearanceSettings() {
  const { appearanceSettings } = appStore;

  const updateSetting = (key: keyof typeof appearanceSettings, value: any) => {
    appStore.updateAppearanceSetting(key, value);
  };

  return (
    <div className={styles.appearanceSection}>
      <div className={styles.appearanceGroupTitle}>Emoji</div>
      <div className={styles.appearanceRows}>
        <div className={styles.appearanceRow} data-settings-label="Use system native emoji" id="appearance-system-emoji">
          <span className={styles.appearanceLabel}>Use system native emoji</span>
          <label className={styles.appearanceSwitch}>
            <input 
              type="checkbox" 
              checked={appearanceSettings.useSystemEmoji} 
              onChange={e => updateSetting('useSystemEmoji', e.currentTarget.checked)} 
            />
            <span className={styles.appearanceSwitchSlider}></span>
          </label>
        </div>
        <div className={styles.appearanceDivider}></div>
        <div className={styles.appearanceRow} data-settings-label="Large emoji" id="appearance-large-emoji">
          <span className={styles.appearanceLabel}>Large emoji</span>
          <label className={styles.appearanceSwitch}>
            <input 
              type="checkbox" 
              checked={appearanceSettings.largeEmoji} 
              onChange={e => updateSetting('largeEmoji', e.currentTarget.checked)} 
            />
            <span className={styles.appearanceSwitchSlider}></span>
          </label>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginTop: '8px', paddingLeft: '22px' }}>
        💡 Emoji sizes are automatically adjusted: 1-3 emojis = large, 4+ emojis = small
      </div>

      <div className={styles.appearanceGroupTitle} style={{marginTop: 32}}>Interface</div>
      <div className={styles.appearanceRows}>
        <div className={styles.appearanceRow} data-settings-label="Reduce transparency" id="appearance-reduce-transparency">
          <span className={styles.appearanceLabel}>Reduce transparency</span>
          <label className={styles.appearanceSwitch}>
            <input 
              type="checkbox" 
              checked={appearanceSettings.reduceTransparency} 
              onChange={e => updateSetting('reduceTransparency', e.currentTarget.checked)} 
            />
            <span className={styles.appearanceSwitchSlider}></span>
          </label>
        </div>
        <div className={styles.appearanceDivider}></div>
        <div className={styles.appearanceRow} data-settings-label="Reduce animations" id="appearance-reduce-animations">
          <span className={styles.appearanceLabel}>Reduce animations</span>
          <label className={styles.appearanceSwitch}>
            <input 
              type="checkbox" 
              checked={appearanceSettings.reduceAnimations} 
              onChange={e => updateSetting('reduceAnimations', e.currentTarget.checked)} 
            />
            <span className={styles.appearanceSwitchSlider}></span>
          </label>
        </div>
      </div>

      <div className={styles.appearanceGroupTitle} style={{marginTop: 32}}>Branding</div>
      <div className={styles.appearanceRows}>
        <ColorPicker
          color={appearanceSettings.brandedColor}
          onChange={(color) => updateSetting('brandedColor', color)}
          label="Brand Color"
          showReset={appearanceSettings.brandedColor !== '#2571FF'}
          onReset={() => updateSetting('brandedColor', '#2571FF')}
          resetText="Reset"
        />
      </div>
      <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginTop: '8px', paddingLeft: '22px' }}>
        💡 Customize the primary brand color used throughout the app
      </div>
    </div>
  );
});