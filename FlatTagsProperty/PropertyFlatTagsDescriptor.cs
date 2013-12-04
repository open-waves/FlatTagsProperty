using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.Shell.ObjectEditing.EditorDescriptors;

namespace OpenWaves.EPiServer.FlatTagsProperty
{
    [EditorDescriptorRegistration(TargetType = typeof(IEnumerable<FlatTag>), UIHint = PropertyFlatTags.UIHint)]
    public class PropertyFlatTagsDescriptor : EditorDescriptor
    {
        public override void ModifyMetadata(global::EPiServer.Shell.ObjectEditing.ExtendedMetadata metadata, IEnumerable<Attribute> attributes)
        {
            var att = attributes.ToArray();

            base.ModifyMetadata(metadata, att);
        }

        public PropertyFlatTagsDescriptor()
        {
            this.ClientEditingClass = "ow-epi-flatTagsProperty.widgets.Tags";
        }
    }
}