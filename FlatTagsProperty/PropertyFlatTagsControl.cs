using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using EPiServer.Web;
using EPiServer.Web.PropertyControls;

namespace OpenWaves.EPiServer.FlatTagsProperty
{
    public class PropertyFlatTagsControl : PropertyDataControl, IRenderTemplate<FlatTag>
    {
        public override void CreateDefaultControls()
        {
            const string tagContainerClass = "tagContainer";

            var tags = PropertyData.Value as IEnumerable<FlatTag>;
            
            if (tags == null)
                return;

            foreach (var tag in tags)
            {
                var tagLiteral = new LiteralControl(tag.name);
                var tagContainer = new TagElementWebControl(HtmlTextWriterTag.Div);
                tagContainer.CssClass = tagContainerClass;
                tagContainer.Controls.Add(tagLiteral);
                
                Controls.Add(tagContainer);
            }

        }
    }

    class TagElementWebControl : WebControl
    {
        public TagElementWebControl(HtmlTextWriterTag tag)
            : base(tag)
        {
        }
    }
}