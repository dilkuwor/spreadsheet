using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Spreadsheet.Web.Utility
{
    public class Cell
    {
        public int RowID { get; set; }
        public Guid SID { get; set; }//usually primary key
        public string Column { get; set; }
        public string NewValue { get; set; }
        public string OldValue { get; set; }
    }
}