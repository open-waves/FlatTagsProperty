﻿namespace OpenWaves.EPiServer.FlatTagsProperty
{
    public class FlatTag
    {
        public int id { get; set; }
        public string name { get; set; }

        public FlatTag()
        {
        }

        public FlatTag(int id, string name)
        {
            this.id = id;
            this.name = name;
        }
    }
}