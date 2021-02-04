<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <!-- This  is used to match everything thing rite up from the root element-->
    <xsl:param name="id" />
    <xsl:template match="/">
    <html>

        <head>

            <title>View Blog</title>

        </head>
        <!-- The body contains the entire formatting for the page in general , like color  font ect-->
        <body style="font-family:Arial;font-size:12pt; background-color:#FFE4E1">

            <!-- The document uses inline styling-->
            <div align="center">
                <img src="banner.gif" alt="Banner Image" />
            </div>

            <table border="0">
                <tr>
                    <!--This reduces the column one's with to fit 80% of the page leaving the rest for the profile section-->
                    <td width="80%">
                        <div style="align:left">
                            <!-- use for each to indicate more than one blog entries that may be there i.e 3 in this page-->
                            <xsl:for-each select="blog/BlogEntries">
                                <!-- The sort just like for-each and value-of  will perform the task on the selected element in this case sorts the blog entries-->
                                <xsl:sort select="CreationTime" />

                                <div style="margin-left:50px;margin-bottom:1em;font-size:10pt;margin-right:50px;">

                                    <h1><b><xsl:value-of select="Title" /></b></h1>

                                    <hr />

                                    <h3><b><i><xsl:value-of select="CreationTime" /></i></b></h3>

                                    <xsl:value-of select="Description" />

                                    <div id="toggleText" class="commentBlock" style="display: none">
                                        <xsl:for-each select="Comments/Comment">
                                            <span style="font-style:italic">
                                                <h3><xsl:value-of select="Title" /></h3>
                                                <div style="position:relative;"><xsl:value-of select="Description" /></div>
                                                <div style="position:relative;left:350px;"><xsl:value-of select="Creator" /></div>          
                                            </span>
                                        </xsl:for-each>
                                    </div>

                                </div>

                            </xsl:for-each>
                        </div>
                    </td>

                    <div style="color:black;position:relative;line-height:20px;float:right;width:100%;height:100%;top:50px;padding:4px;align:right">
                        <!-- this is the other column of the table which contains the profile where each element is just a value-of selcted type-->
                        <td margin-left="75px" wigth="100%">

                            <h3>Profile :</h3>
                            <img src="me.gif" alt="display pic" width="100" height="100" />
                            <br /><br /> <b>Name :</b><xsl:value-of select="blog/Profile/Name" /><br />
                            <br /><b>Age:</b><xsl:value-of select="blog/Profile/Age" /><br />
                            <br /><b>Birth Place :</b><xsl:value-of select="blog/Profile/BirthPlace" /><br />
                            <br /><b>Current Residence :</b><xsl:value-of select="blog/Profile/CurrentResidence" /><br />
                            <br /><b>Occupation :</b><xsl:value-of select="blog/Profile/Occupation" /><br />
                            <xsl:value-of select="blog/Profile/gender" />

                        </td>
                    </div>

                </tr>
            </table>

            <a href="#" onclick="commentToggle(this); return false;" title="Show Comments">Show comments</a>

        </body>

        </html>
    </xsl:template>
</xsl:stylesheet>
