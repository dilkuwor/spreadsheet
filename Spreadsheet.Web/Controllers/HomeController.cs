using Newtonsoft.Json;
using Spreadsheet.Web.Data;
using Spreadsheet.Web.Utility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Spreadsheet.Web.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
        [HttpGet]
        public string Products()
        {
            Func<string, string> doIt = (x) =>
            {
                if (null != x && x.Length > 20)
                    return x.Substring(0, 19) + "...";
                else
                    return x;
            };
            SPDataContext context = new SPDataContext();
            List<product> products = context.products.ToList();
            products.ForEach(s => s.description = doIt(s.description));
            var p = new product();
            products.Add(p);
            return JsonConvert.SerializeObject(products);



        }


        [HttpPost]
        public string UpdateProduct(List<Cell> updates)
        {
            if (updates == null)
                return null;
            SPDataContext context = new SPDataContext();
            List<product> products = context.products.ToList();

            foreach (Cell c in updates)
            {
                try
                {
                    product p = products.Where(r => r.SID == c.SID).SingleOrDefault();
                    if (null != p && c.NewValue != "[object Object]")
                    {
                        System.Reflection.PropertyInfo propertyInfo = p.GetType().GetProperty(c.Column);
                        propertyInfo.SetValue(p, c.NewValue);
                        context.SubmitChanges();
                    }
                    else
                    {
                        product @new = new product();
                        @new.SID = Guid.NewGuid();
                        System.Reflection.PropertyInfo propertyInfo = @new.GetType().GetProperty(c.Column);
                        if (c.NewValue != "[object Object]")
                            propertyInfo.SetValue(@new, c.NewValue);
                        context.products.InsertOnSubmit(@new);
                        context.SubmitChanges();

                        updates.Where(r => r.RowID == c.RowID).ToList().ForEach(r => r.SID = @new.SID);
                        context = new SPDataContext();
                        products = context.products.ToList();


                    }

                }
                catch (Exception)
                {


                }

            }

            var result = new
            {
                success = true
            };

            return JsonConvert.SerializeObject(result);


        }

        [HttpPost]
        public string AddRow()
        {
            using (SPDataContext context = new SPDataContext())
            {

                product @new = new product();
                @new.SID = Guid.NewGuid();
                context.products.InsertOnSubmit(@new);
                context.SubmitChanges();

            }
            var result = new
            {
                success = true
            };

            return JsonConvert.SerializeObject(result);
        }

        [HttpGet]
        public string GetDetail(string sid, string property)
        {
            var detail = string.Empty;
            try
            {
                using (SPDataContext context = new SPDataContext())
                {

                    List<product> products = context.products.ToList();
                    product p = products.Where(r => r.SID == new Guid(sid)).SingleOrDefault();
                    System.Reflection.PropertyInfo propertyInfo = p.GetType().GetProperty(property);
                    var d = propertyInfo.GetValue(p);
                    if (null != d)
                    {
                        detail = d.ToString();
                    }
                }
            }
            catch (Exception e)
            {

            }
            return detail;
        }
        [HttpPost]
        public string DeleteRows(List<string> rows)
        {
            try
            {
                using (SPDataContext context = new SPDataContext())
                {
                    List<product> products = context.products.ToList();
                    foreach (String s in rows)
                    {
                        List<product> deleteMe = new List<product>();
                        try
                        {
                            Guid id = new Guid(s);
                            product p = products.Where(r => r.SID == id).SingleOrDefault();
                            deleteMe.Add(p);


                        }
                        catch (Exception)
                        {

                        }
                        context.products.DeleteAllOnSubmit(deleteMe);
                        context.SubmitChanges();
                    }

                }
            }
            catch (Exception)
            {


            }


            var result = new
            {
                success = true
            };

            return JsonConvert.SerializeObject(result);


        }
    }
}