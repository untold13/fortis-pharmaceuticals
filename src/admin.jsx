import { DecapCmsCore as CMS } from "decap-cms-core";
import { GitHubBackend } from "decap-cms-backend-github";
import StringWidget from "decap-cms-widget-string";
import NumberWidget from "decap-cms-widget-number";
import TextWidget from "decap-cms-widget-text";
import ImageWidget from "decap-cms-widget-image";
import SelectWidget from "decap-cms-widget-select";
import ListWidget from "decap-cms-widget-list";
import ObjectWidget from "decap-cms-widget-object";
import BooleanWidget from "decap-cms-widget-boolean";
import RelationWidget from "decap-cms-widget-relation";
import { preSave } from "./admin-validation";
import { en } from "decap-cms-locales";
import { adminConfig } from "./admin-config";

// Only required, maintained CMS widgets are shipped. No code or raw HTML editor.
CMS.registerLocale("en", en);
CMS.registerBackend("github", GitHubBackend);
CMS.registerWidget(
  [
    StringWidget,
    NumberWidget,
    TextWidget,
    ImageWidget,
    SelectWidget,
    ListWidget,
    ObjectWidget,
    BooleanWidget,
    RelationWidget,
  ].map((w) => w.Widget()),
);
CMS.registerEventListener({ name: "preSave", handler: preSave });
CMS.init({ config: adminConfig });
