import {reply} from '../lib/cms-auth.js';
export default function handler(req,res){reply(res,410,{error:'GitHub sign-in has been replaced by the Fortis username and password login.'});}
