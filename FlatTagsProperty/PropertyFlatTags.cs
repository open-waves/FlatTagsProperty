using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using EPiServer.Framework.Serialization;
using EPiServer.PlugIn;
using OpenWaves.EPiServer.CustomProperties;

namespace OpenWaves.EPiServer.FlatTagsProperty
{
    [PropertyDefinitionTypePlugIn(DisplayName = "Flat Tags List")]
    public class PropertyFlatTags : LongStringProperty<IEnumerable<FlatTag>>
    {
        public const string UIHint = "PropertyFlatTags";

        private readonly IObjectSerializer _serializer;

        private static IObjectSerializer GetSerializer()
        {
            var objectSerializerFactory = global::EPiServer.ServiceLocation.ServiceLocator.Current.GetInstance<IObjectSerializerFactory>();
            var objectSerializer = objectSerializerFactory.GetSerializer(KnownContentTypes.Json);
            return objectSerializer;
        }

        public PropertyFlatTags()
        {
            _serializer = GetSerializer();
        }

        protected override string SerializeValue(IEnumerable<FlatTag> value)
        {
            var result = new StringBuilder();
            _serializer.Serialize(new StringWriter(result), value);
            return result.ToString();
        }

        protected override IEnumerable<FlatTag> DeserializeValue(string serializedValue)
        {
            return _serializer.Deserialize<IEnumerable<FlatTag>>(new StringReader(serializedValue));

        }

        protected override IEnumerable<FlatTag> DefaultValue
        {
            get { return Enumerable.Empty<FlatTag>(); }
        }

        protected override LongStringProperty<IEnumerable<FlatTag>> CreateInstance(IEnumerable<FlatTag> value)
        {
            return new PropertyFlatTags { Value = value };
        }
    }
}