using System.Web;
using System.Web.Optimization;

namespace Spreadsheet.Web
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap-wysiwyg.js",
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js"));
            bundles.Add(new ScriptBundle("~/bundles/slidemenu").Include(
                     "~/Scripts/classie.js",
                     "~/Scripts/modernizr.custom.js"));
            bundles.Add(new ScriptBundle("~/bundles/spreadsheet").Include(
                 "~/Scripts/handsontable.full.js",
                    "~/Scripts/packed.js"));
            //bootstrap-wysiwyg

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/component.css",//slide and push menu
                      "~/Content/index.css",//slide and push menu
                      "~/Content/site.css", "~/Content/handsontable.full.css"));
        }
    }
}
