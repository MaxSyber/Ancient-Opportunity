import { ExternalLink, Hammer, PackageSearch } from "lucide-react";

export default function FieldEquipmentStoresTab() {
  return (
    <section className="equipment-stores-panel" aria-labelledby="equipment-stores-heading">
      <div className="equipment-stores-intro">
        <span className="equipment-stores-icon" aria-hidden="true">
          <Hammer size={28} />
        </span>
        <div>
          <p className="eyebrow">Field resources</p>
          <h2 id="equipment-stores-heading">Field Equipment Stores</h2>
          <p>
            Discover makers and suppliers of archaeological screens, excavation tools,
            field gear, and specialty equipment.
          </p>
        </div>
      </div>

      <div className="equipment-empty-state">
        <PackageSearch size={34} aria-hidden="true" />
        <h3>Store directory coming soon</h3>
        <p>Links to trusted screen builders and field-tool creators will appear here.</p>
        <span className="equipment-link-preview">
          <ExternalLink size={16} />
          External store links will open in a new tab
        </span>
      </div>
    </section>
  );
}
