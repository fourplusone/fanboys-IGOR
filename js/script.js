/* Author: Martin Pittenauer */


var episodes;

$(document).ready(function() {
  var is_safari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

  var rssurl = "/episodes.mp3.rss";
  //if (is_safari) rssurl = "/episodes.m4a.rss"; // Safari gets the nicer feed
  
  if (self.location.protocol == "file:") rssurl = "episodes.mp3.rss";
  $.get(rssurl, function(xml){
    var json = $.xmlToJSON(xml, null, 1);
    if (self.location.protocol == "file:") json = $.xmlToJSON($.textToXML(xml), null, 1);
    episodes = json.channel[0].item.reverse();
    // FIXME Sort by date
    var latest;
    $.each(episodes, function(index, value) { 
      $("#episode-list").prepend('<tr><td><a href="javascript:selectEpisode('+index+')">'+value.title[0].Text+"</a></td></tr>");
      latest = index;
    });
    
    var urlhash = self.location.hash

    if (urlhash.match(/#\d+$/)) {
    }    
    
    if (urlhash.match(/#\d+:\d+:\d+:\d+/)) {
      urlhash = urlhash.substring(1)
      var jumpTimestamp = urlhash.split(":",4);;
      var jumpTo = timestamp2seconds(jumpTimestamp[1],jumpTimestamp[2],jumpTimestamp[3])
      var episodeNumber = Math.floor(jumpTimestamp[0])
      $.each(episodes, function(index, value) { 
        if ("FAN"+pad(episodeNumber,3) == value.guid[0].Text) {
          selectEpisode(index, jumpTo);
        }
      });
    } else if (urlhash.match(/#\d+$/)){
      urlhash = urlhash.substring(1)
      var episodeNumber = Math.floor(urlhash)
      $.each(episodes, function(index, value) { 
        if ("FAN"+pad(episodeNumber,3) == value.guid[0].Text) {
          selectEpisode(index, -1);
        }
      });
    } else {
      selectEpisode(latest, -1);
    }
  });  
    
});

var audioplayer;
var progressTimer;
var jumpPercent;

function selectEpisode(episodenumber, jumpSeconds) {
  // Clean up
  $("#chaptermarks").empty();
  $("#audioplayer").empty();
  $("#title").empty();
  var styles = $("style")
  if (styles.length > 0 && styles[0].title === "audiojs") $(styles[0]).remove()
  clearInterval(progressTimer);
  
  // Fill in new episode
  var preload = (jumpSeconds>0)?"auto":"none";
  var episode = episodes[episodenumber];
  var enclosure = episode.enclosure[0].url;
  var flattr;
  if (episode.link!=undefined)
    if(episode.link[0].rel == "payment") 
        flattr = episode.link[0].href;
  
  if (self.location.protocol == "file:") enclosure = "http://localhost/~pittenau/1.mp3";
  $("#title").append('<a href="'+enclosure+'">'+episode.title[0].Text+'</a>');
  $("#audioplayer").append('<audio src="'+enclosure+'" preload="'+preload+'"></audio>');

  if (flattr) $("#episode-flattr-link").attr("href", flattr);
  else $("#episode-flattr-link").attr("href", "http://flattr.com/thing/268597/fanb0ys-on-Twitter");

  var durationArray = episode.duration[0].Text.split(":",3);
  var duration = timestamp2seconds(durationArray[0],durationArray[1],durationArray[2]);

  var chaptermarks = $.parseJSON(episode.chaptermarks[0].Text)
  $.each(chaptermarks, function(index, value) { 
    // FIXME Sort by date
      var link = value.link;
      var name = value.name;
      var mark = index / duration;
      if (link) name = '<a target="_blank" href="'+link+'">'+name+'</a>';
      $("#chaptermarks").append('<tr><td class="unloaded timecode" rel="'+mark+'">'+seconds2timestamp(index)+"</td><td>"+name+"</td></tr>");
  });
  var as = audiojs.createAll();
  audioplayer = as[0]
  
  jumpPercent = jumpSeconds / duration;  
}

function updateSkipMarks(p){
  //var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  //if (is_chrome) return;

  $('.unloaded').each(function(){
    var markPercent = $(this).attr('rel');
    log(markPercent)
    if (markPercent<p) {
      $(this).removeClass('unloaded');
      var thisText = $(this).text();
      $(this).empty();
      $(this).append('<a href="javascript:audioplayer.skipTo('+markPercent+')">'+thisText+'</a>');
    }
  });

  if ((jumpPercent > 0)&&(jumpPercent<p)) {
    audioplayer.skipTo(jumpPercent)
    audioplayer.play()
    jumpPercent = -1
  }

}


function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str
    }
    return str
}

function seconds2timestamp(index) {
  var hours = Math.floor(index / (60*60))
  var minutes = Math.floor((index-hours*60*60) / 60)
  var seconds = Math.floor(index-hours*60*60-minutes*60)
  return pad(hours,2)+":"+pad(minutes,2)+":"+pad(seconds,2)
}

function timestamp2seconds(h,m,s) {
  var duration = Math.floor(h)*3600 + Math.floor(m)*60 + Math.floor(s)
  return duration
}

function showimpressum() {
    alert("Impressum gem. § 5 TMG und § 55 Rundfunkstaatsvertrag\n\nhttp://fanbóys.org ist ein publizistisches Angebot von Martin Pittenauer.\n\nPostanschrift\n\nMartin Pittenauer\nLandwehrstrasse 37\n80336 München\n\nE-Mail\n\nall@fanboys.fm\n\nVerantwortlicher nach § 55, Abs. 2, Rundfunkstaatsvertrag: Martin Pittenauer");
}